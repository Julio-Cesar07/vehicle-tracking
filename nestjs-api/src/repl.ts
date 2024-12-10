import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('oi');
  await repl(AppModule);
}

bootstrap();
