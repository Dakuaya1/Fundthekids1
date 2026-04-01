import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; passwordHash: string; role: Role }) {
    const saltOrRounds = 10;
    // Check if it's already a bcrypt hash (starts with $2b$ or $2a$) to avoid double-hashing from seeders or future refs
    const passwordHash = data.passwordHash.startsWith('$2')
      ? data.passwordHash
      : await bcrypt.hash(data.passwordHash, saltOrRounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { ...data, passwordHash },
      });

      if (user.role === Role.NGO) {
        await tx.nGO.create({
          data: { userId: user.id, name: 'Default NGO Name', region: 'Global' },
        });
      } else if (user.role === Role.SPONSOR) {
        await tx.sponsor.create({
          data: { userId: user.id },
        });
      } else if (user.role === Role.VOLUNTEER) {
        await tx.volunteer.create({
          data: { userId: user.id, assignedRegion: 'Global' },
        });
      }

      return user;
    });

    if (user.role === Role.GUARDIAN) {
      try {
        await this.prisma.guardian.create({
          data: {
            userId: user.id,
            fullName: user.email.split('@')[0],
            region: 'Global',
            specialties: ['Education', 'Lodging', 'Student Support'],
          },
        });
      } catch (error) {
        this.logger.warn(
          'Guardian profile creation skipped because the database is not yet migrated for guardian records.',
        );
        this.logger.debug(String(error));
      }
    }

    return user;
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          guardian: {
            select: {
              fullName: true,
              region: true,
              organizationName: true,
              isAvailable: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.warn(
        'Falling back to basic user list because guardian tables are unavailable.',
      );
      this.logger.debug(String(error));

      return this.prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true },
      });
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          guardian: {
            select: {
              fullName: true,
              region: true,
              organizationName: true,
              specialties: true,
              isAvailable: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.warn(
        'Falling back to basic user profile because guardian tables are unavailable.',
      );
      this.logger.debug(String(error));

      return this.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true, createdAt: true },
      });
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
