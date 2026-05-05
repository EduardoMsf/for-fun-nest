import { IsString } from 'class-validator';

export class SetTransactionDto {
  @IsString()
  transactionId: string;
}
