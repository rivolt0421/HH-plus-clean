import { Registration } from '../register';

export const registrationRepoToken = Symbol('RegistrationRepo');
export interface RegistrationRepo {
  getByUserId(userId: number): Promise<Registration[]>;
  create(registration: Omit<Registration, 'id'>): Promise<Registration>;
}
