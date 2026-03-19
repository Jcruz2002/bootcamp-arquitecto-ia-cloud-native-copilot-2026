import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      message: 'NestJS API (Lab 19) running',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
