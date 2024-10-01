import { Inject, Injectable } from '@nestjs/common';
import { Registration } from './register';
import {
  RegistrationRepo,
  registrationRepoToken,
} from './interface/registration.repository';

@Injectable()
export class RegisterService {
  constructor(
    @Inject(registrationRepoToken)
    private readonly registrationRepo: RegistrationRepo,
  ) {}

  async register(userId: number, slotId: number): Promise<Registration> {
    return await this.registrationRepo.create({ userId, slotId });
  }

  async getOfUser(userId: number): Promise<Registration[]> {
    return await this.registrationRepo.getByUserId(userId);
  }
}
