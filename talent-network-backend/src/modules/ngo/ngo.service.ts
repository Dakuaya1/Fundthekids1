import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateChildDto } from './dto/create-child.dto';

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
    });
  }
}
