import { IsNotEmpty, IsNumber } from 'class-validator';

export class DoRegisterReq {
  @IsNumber()
  @IsNotEmpty()
  slotId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
