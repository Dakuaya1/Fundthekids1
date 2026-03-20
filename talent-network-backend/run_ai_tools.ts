import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AiService } from './src/ai-agents/ai.service';
import { Role } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const aiService = app.get(AiService);
  
  try {
    console.log('Sending query...');
    // Use the admin role and known admin user ID 1562775a-63f9-4eae-80fb-048c2dd9b5ac which works from earlier
    const res = await aiService.query("Which children need urgent funding right now?", "1562775a-63f9-4eae-80fb-048c2dd9b5ac", Role.ADMIN);
    console.log("Success:", res);
  } catch (err) {
    console.error("FATAL ERROR EXECUTING AI WORFKLOW:");
    console.error(err);
  }
  
  await app.close();
}
bootstrap();
