import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { registrationRepoToken } from './interface/registration.repository';
import { RegistrationRepoImpl } from 'src/infrastructure/persistence/register/registration.repository.impl';

@Module({
  providers: [
    RegisterService,
    { provide: registrationRepoToken, useClass: RegistrationRepoImpl },
  ],
})
export class RegistrationModule {}
