import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<b>Hello World, this is me!</b>';
  }
}