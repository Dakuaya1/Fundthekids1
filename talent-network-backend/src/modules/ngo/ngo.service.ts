import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateChildDto } from './dto/create-child.dto';
import { ChildStatus } from '@prisma/client';

@Injectable()
export class NgoService {
  constructor(private prisma: PrismaService) { }

  async createChild(userId: string, createChildDto: CreateChildDto) {
    const ngo = await this.prisma.nGO.findUnique({
      where: { userId },
    });

    if (!ngo) {
      throw new NotFoundException('NGO profile not found for this user');
    }

    return this.prisma.child.create({
      data: {
        name: createChildDto.name,
        dob: new Date(createChildDto.dob),
        talentCategory: createChildDto.talentCategory,
        city: createChildDto.city,
        location: createChildDto.location,
        pleaVideoUrl: createChildDto.pleaVideoUrl,
        mediaUrls: createChildDto.mediaUrls || [],
        ngoId: ngo.id,
        status: ChildStatus.PENDING,
      },
    });
  }

  async getChildren(userId: string) {
    const ngo = await this.prisma.nGO.findUnique({
      where: { userId },
    });

    if (!ngo) {
      return [];
    }

    return this.prisma.child.findMany({
      where: { ngoId: ngo.id },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  async verifyChild(userId: string, childId: string) {
    const ngo = await this.prisma.nGO.findUnique({
      where: { userId },
    });

    if (!ngo) {
      throw new NotFoundException('NGO profile not found for this user');
    }

    const child = await this.prisma.child.findFirst({
      where: { id: childId, ngoId: ngo.id },
    });

    if (!child) {
      throw new NotFoundException('Child not found for this NGO');
    }

    return this.prisma.child.update({
      where: { id: childId },
      data: { status: ChildStatus.VERIFIED },
    });
  }
}
