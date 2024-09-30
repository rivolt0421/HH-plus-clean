import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationModule } from './domain/register/register.module';
import { SlotModule } from './domain/slot/slot.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [SlotModule, RegistrationModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
