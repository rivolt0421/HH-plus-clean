import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { LectureFacade } from 'src/application/lecture.facade';
import { DoRegisterReq } from './dto/do-register.req';
import { SlotDto } from './dto/get-available-slots.res';
import { RegisteredDto } from './dto/get-registration.res';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureFacade: LectureFacade) {}

  @Get('available')
  async getAvailableSlots(): Promise<SlotDto[]> {
    const slots = await this.lectureFacade.getAvailableSlots();
    return slots.map((slot) => new SlotDto(slot));
  }

  @Get('registered/:userId')
  async getRegistered(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<RegisteredDto[]> {
    const registeredList = await this.lectureFacade.getRegisteredOfUser(userId);

    return registeredList.map(
      ({ registration, slot }) => new RegisteredDto(registration, slot),
    );
  }

  @Post()
  async doRegister(
    @Body(new ValidationPipe()) body: DoRegisterReq,
  ): Promise<boolean> {
    return await this.lectureFacade.doRegister(body.userId, body.slotId);
  }
}
