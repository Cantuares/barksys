import { SetMetadata } from '@nestjs/common';

export const REQUIRE_COMPANY_KEY = 'requireCompany';
export const RequireCompany = () => SetMetadata(REQUIRE_COMPANY_KEY, true);
