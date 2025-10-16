import { IsBoolean } from 'class-validator';

export class WorkingDaysDto {
  @IsBoolean()
  mon: boolean;

  @IsBoolean()
  tue: boolean;

  @IsBoolean()
  wed: boolean;

  @IsBoolean()
  thu: boolean;

  @IsBoolean()
  fri: boolean;

  @IsBoolean()
  sat: boolean;

  @IsBoolean()
  sun: boolean;
}
