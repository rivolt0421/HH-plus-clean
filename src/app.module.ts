import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LectureModule } from './application/lecture.module';

@Module({
  imports: [LectureModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
