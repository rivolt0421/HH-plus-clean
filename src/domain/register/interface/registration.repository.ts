import { Registration } from '../register';
import { Transaction } from 'src/database/prisma.service';

export const registrationRepoToken = Symbol('RegistrationRepo');
export interface RegistrationRepo {
  getByUserId(userId: number, tx?: Transaction): Promise<Registration[]>;
  create(
    registration: Omit<Registration, 'id'>,
    tx?: Transaction,
  ): Promise<Registration>;
}
