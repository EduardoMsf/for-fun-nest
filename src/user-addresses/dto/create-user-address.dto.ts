import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserAddressDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  postalCode: string;

  @IsString()
  phone: string;

  @IsString()
  city: string;

  @IsString()
  countryId: string;

  @IsString()
  userId: string;
}
