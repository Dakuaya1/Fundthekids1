import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { PrismaService } from '../../config/prisma.service';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [AiEngineModule],
  providers: [ChildrenService, PrismaService],
  controllers: [ChildrenController],
})
export class ChildrenModule {}
