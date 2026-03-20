import { Module } from '@nestjs/common';
import { NgoService } from './ngo.service';
import { NgoController } from './ngo.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  providers: [NgoService, PrismaService],
  controllers: [NgoController],
})
export class NgoModule {}
