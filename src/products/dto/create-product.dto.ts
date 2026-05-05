import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';
import { Gender, Size } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: "Men's Chill Crew Neck Sweatshirt" })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'Premium heavyweight sweatshirt with soft fleece interior.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  inStock: number;

  @ApiPropertyOptional({ example: 75 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'mens_chill_crew_neck_sweatshirt' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ enum: Size, isArray: true, example: ['S', 'M', 'L'] })
  @IsEnum(Size, { each: true })
  @IsArray()
  @IsOptional()
  size?: Size[];

  @ApiPropertyOptional({ isArray: true, example: ['sweatshirt', 'cotton'] })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ enum: Gender, example: 'men' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsString()
  categoryId: string;
}
