import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'API welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('showcase')
  @ApiOperation({ summary: 'Get public platform data for the landing page' })
  @ApiResponse({ status: 200, description: 'Successful showcase data retrieval' })
  getShowcaseData() {
    return this.appService.getShowcaseData();
  }
}
