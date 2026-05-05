import { IsString, IsUrl } from 'class-validator';

export class CreateProductImageDto {
  @IsUrl()
  url: string;

  @IsString()
  productId: string;
}
