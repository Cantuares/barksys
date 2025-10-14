import { Injectable, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';

export interface CreateCompanyDto {
  name: string;
  email: string;
  taxId: string;
  taxType: string;
  billingAddress: string;
  city: string;
  country?: string;
  postalCode?: string;
}

@Injectable()
export class CompaniesService {
  constructor(
    private readonly em: EntityManager,
    private readonly i18n: I18nService,
  ) {}

  async create(user: User, createCompanyDto: CreateCompanyDto): Promise<Company> {
    const lang = I18nContext.current()?.lang || 'en';

    // Check if company email already exists
    const existingByEmail = await this.em.findOne(Company, { email: createCompanyDto.email });
    if (existingByEmail) {
      throw new ConflictException(this.i18n.translate('companies.errors.emailExists', { lang }));
    }

    // Check if tax ID already exists
    const existingByTaxId = await this.em.findOne(Company, { taxId: createCompanyDto.taxId });
    if (existingByTaxId) {
      throw new ConflictException(this.i18n.translate('companies.errors.taxIdExists', { lang }));
    }

    const company = this.em.create(Company, {
      user,
      name: createCompanyDto.name,
      email: createCompanyDto.email,
      taxId: createCompanyDto.taxId,
      taxType: createCompanyDto.taxType as any,
      billingAddress: createCompanyDto.billingAddress,
      city: createCompanyDto.city,
      country: createCompanyDto.country || 'PT',
      postalCode: createCompanyDto.postalCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(company);

    // Set bidirectional relationship: user.company_id = company.id
    user.company = company;
    user.updatedAt = new Date();
    await this.em.persistAndFlush(user);

    return company;
  }
}
