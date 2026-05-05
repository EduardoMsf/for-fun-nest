import { IsString, MinLength } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  id: string;

  @IsString()
  @MinLength(1)
  name: string;
}
