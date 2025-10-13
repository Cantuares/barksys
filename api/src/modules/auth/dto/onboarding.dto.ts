import { IsString, IsEmail, IsEnum, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaxType } from '../../companies/entities/company.entity';

export class OnboardingDto {
  @ApiProperty({
    example: 'My Company Ltd',
    description: 'Company name',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'company@example.com',
    description: 'Company email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456789',
    description: 'Tax identification number',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  taxId: string;

  @ApiProperty({
    example: 'nif',
    description: 'Tax type',
    enum: TaxType,
  })
  @IsEnum(TaxType)
  taxType: TaxType;

  @ApiProperty({
    example: 'Rua Example, 123',
    description: 'Billing address',
  })
  @IsString()
  @MinLength(5)
  billingAddress: string;

  @ApiProperty({
    example: 'Lisboa',
    description: 'City',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    example: 'PT',
    description: 'Country code (ISO 3166-1 alpha-2)',
    default: 'PT',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a valid ISO 3166-1 alpha-2 code (2 uppercase letters)' })
  country?: string;

  @ApiProperty({
    example: '1000-001',
    description: 'Postal code',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}
