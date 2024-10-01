import { Module } from '@nestjs/common';
import { RegisterService } from '../domain/register/register.service';
import { registrationRepoToken } from '../domain/register/interface/registration.repository';
import { RegistrationRepoImpl } from 'src/infrastructure/persistence/register/registration.repository.impl';
import { SlotService } from 'src/domain/slot/slot.service';
import { slotRepoToken } from 'src/domain/slot/interface/slot.repository';
import { SlotRepoImpl } from 'src/infrastructure/persistence/slot/slot.repository.impl';
import { LectureFacade } from './lecture.facade';

@Module({
  providers: [
    LectureFacade,
    RegisterService,
    { provide: registrationRepoToken, useClass: RegistrationRepoImpl },
    SlotService,
    { provide: slotRepoToken, useClass: SlotRepoImpl },
  ],
})
export class LectureModule {}
