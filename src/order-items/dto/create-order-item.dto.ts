import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { Size } from '@prisma/client';

export class CreateOrderItemDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(Size)
  size: Size;

  @IsString()
  orderId: string;

  @IsString()
  productId: string;
}
