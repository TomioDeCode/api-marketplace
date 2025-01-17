import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const greeting = 'Hello World!';
    return greeting;
  }

  getCustomHello(name: string): string {
    if (!name) {
      return this.getHello();
    }
    return `Hello ${name}!`;
  }
}
