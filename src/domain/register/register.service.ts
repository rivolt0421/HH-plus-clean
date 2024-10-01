import { Inject, Injectable } from '@nestjs/common';
import { Registration } from './register';
import {
  RegistrationRepo,
  registrationRepoToken,
} from './interface/registration.repository';
import { Transaction } from 'src/database/prisma.service';
@Injectable()
export class RegisterService {
  constructor(
    @Inject(registrationRepoToken)
    private readonly registrationRepo: RegistrationRepo,
  ) {}

  async register(
    userId: number,
    slotId: number,
    tx?: Transaction,
  ): Promise<Registration> {
    try {
      return await this.registrationRepo.create({ userId, slotId }, tx);
    } catch (e) {
      if (e instanceof RegistrationExistsError) {
        throw new Error('이미 등록된 특강입니다.');
      }
      throw e;
    }
  }

  async getOfUser(userId: number, tx?: Transaction): Promise<Registration[]> {
    return await this.registrationRepo.getByUserId(userId, tx);
  }
}

export class RegistrationExistsError extends Error {}
