import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AssignGuardianDto } from './dto/assign-guardian.dto';
import { UpdateGuardianServiceDto } from './dto/update-guardian-service.dto';
import { Role, ServiceStatus } from '@prisma/client';

@Injectable()
export class GuardianService {
  constructor(private prisma: PrismaService) {}

  async getAvailableGuardians() {
    return this.prisma.guardian.findMany({
      where: { isAvailable: true },
      orderBy: [{ region: 'asc' }, { fullName: 'asc' }],
      include: {
        user: { select: { id: true, email: true } },
        _count: { select: { assignedChildren: true } },
      },
    });
  }

  async getGuardianDashboard(userId: string) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true } },
        assignedChildren: {
          orderBy: { name: 'asc' },
          include: {
            ngo: { select: { name: true, region: true } },
            plans: {
              where: { status: 'ACTIVE' },
              include: {
                payments: {
                  where: { status: 'COMPLETED' },
                  select: { amount: true, paymentDate: true },
                },
              },
            },
            serviceRecord: true,
          },
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException('Guardian profile not found');
    }

    const children = guardian.assignedChildren.map((child) => {
      const totalCommitted = child.plans.reduce((sum, plan) => sum + plan.amount, 0);
      const totalReceived = child.plans.reduce(
        (sum, plan) =>
          sum +
          plan.payments.reduce(
            (paymentSum, payment) => paymentSum + payment.amount,
            0,
          ),
        0,
      );

      return {
        id: child.id,
        name: child.name,
        city: child.city,
        location: child.location,
        talentCategory: child.talentCategory,
        status: child.status,
        ngo: child.ngo,
        totalCommitted,
        totalReceived,
        isFunded: totalReceived > 0,
        serviceRecord: child.serviceRecord,
      };
    });

    return {
      guardian: {
        id: guardian.id,
        userId: guardian.userId,
        fullName: guardian.fullName,
        region: guardian.region,
        organizationName: guardian.organizationName,
        specialties: guardian.specialties,
        isAvailable: guardian.isAvailable,
        email: guardian.user.email,
      },
      summary: {
        assignedChildren: children.length,
        fundedChildren: children.filter((child) => child.isFunded).length,
        deliveryInProgress: children.filter((child) => {
          const record = child.serviceRecord;
          return (
            record?.schoolStatus === ServiceStatus.IN_PROGRESS ||
            record?.lodgingStatus === ServiceStatus.IN_PROGRESS ||
            record?.activityStatus === ServiceStatus.IN_PROGRESS
          );
        }).length,
      },
      children,
    };
  }

  async assignGuardianToChild(
    actorId: string,
    actorRole: Role,
    dto: AssignGuardianDto,
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id: dto.childId },
      include: { ngo: true, serviceRecord: true },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (child.status !== 'VERIFIED') {
      throw new ForbiddenException(
        'Guardians can only be assigned after the child is verified',
      );
    }

    if (actorRole === Role.NGO) {
      const ngo = await this.prisma.nGO.findUnique({ where: { userId: actorId } });
      if (!ngo || ngo.id !== child.ngoId) {
        throw new ForbiddenException(
          'You can only assign guardians to children from your NGO',
        );
      }
    } else if (actorRole !== Role.ADMIN) {
      throw new ForbiddenException('Only NGOs and admins can assign guardians');
    }

    const guardian = await this.prisma.guardian.findUnique({
      where: { userId: dto.guardianUserId },
    });

    if (!guardian) {
      throw new NotFoundException('Guardian not found');
    }

    await this.prisma.child.update({
      where: { id: dto.childId },
      data: { guardianId: dto.guardianUserId },
    });

    return this.prisma.guardianService.upsert({
      where: { childId: dto.childId },
      update: {
        guardianUserId: dto.guardianUserId,
      },
      create: {
        childId: dto.childId,
        guardianUserId: dto.guardianUserId,
      },
    });
  }

  async autoAssignGuardianForFundedChild(childId: string) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: { ngo: true, serviceRecord: true },
    });

    if (!child || child.status !== 'VERIFIED') {
      return null;
    }

    const existingGuardianUserId = child.guardianId ?? child.serviceRecord?.guardianUserId;
    if (existingGuardianUserId) {
      return this.prisma.guardianService.upsert({
        where: { childId },
        update: { guardianUserId: existingGuardianUserId },
        create: { childId, guardianUserId: existingGuardianUserId },
      });
    }

    const guardian = await this.prisma.guardian.findFirst({
      where: {
        isAvailable: true,
        OR: [{ region: child.ngo.region }, { region: 'Global' }],
      },
      orderBy: [{ region: 'asc' }, { createdAt: 'asc' }],
    });

    if (!guardian) {
      return null;
    }

    await this.prisma.child.update({
      where: { id: childId },
      data: { guardianId: guardian.userId },
    });

    return this.prisma.guardianService.create({
      data: {
        childId,
        guardianUserId: guardian.userId,
        schoolStatus: ServiceStatus.READY_TO_START,
        lodgingStatus: ServiceStatus.READY_TO_START,
        activityStatus: ServiceStatus.READY_TO_START,
      },
    });
  }

  async updateServiceForGuardian(
    guardianUserId: string,
    childId: string,
    dto: UpdateGuardianServiceDto,
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: { serviceRecord: true },
    });

    if (!child || child.guardianId !== guardianUserId) {
      throw new NotFoundException('Assigned child not found for guardian');
    }

    const currentRecord =
      child.serviceRecord ??
      (await this.prisma.guardianService.create({
        data: {
          childId,
          guardianUserId,
        },
      }));

    const statuses = [
      dto.schoolStatus ?? currentRecord.schoolStatus,
      dto.lodgingStatus ?? currentRecord.lodgingStatus,
      dto.activityStatus ?? currentRecord.activityStatus,
    ];

    const allCompleted = statuses.every(
      (status) => status === ServiceStatus.COMPLETED,
    );
    const hasStarted = statuses.some(
      (status) =>
        status === ServiceStatus.IN_PROGRESS ||
        status === ServiceStatus.COMPLETED,
    );

    return this.prisma.guardianService.update({
      where: { childId },
      data: {
        ...dto,
        startedAt: hasStarted ? currentRecord.startedAt ?? new Date() : currentRecord.startedAt,
        completedAt: allCompleted ? new Date() : null,
      },
    });
  }
}
