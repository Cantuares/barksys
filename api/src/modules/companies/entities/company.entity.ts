import { Entity, PrimaryKey, Property, Unique, Index, ManyToOne, OneToMany, Collection, Enum } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../../users/entities/user.entity';

export enum TaxType {
  NIF = 'nif',
  VAT = 'vat',
  NIPC = 'nipc',
}

@Entity({ tableName: 'companies' })
export class Company {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @ManyToOne(() => User, { fieldName: 'user_id' })
  user: User;

  @OneToMany(() => User, user => user.company)
  users = new Collection<User>(this);

  @Property()
  name: string;

  @Property()
  @Unique()
  @Index()
  email: string;

  @Property({ fieldName: 'tax_id' })
  @Unique()
  @Index()
  taxId: string;

  @Enum({ items: () => TaxType, fieldName: 'tax_type' })
  taxType: TaxType;

  @Property({ fieldName: 'billing_address' })
  billingAddress: string;

  @Property()
  city: string;

  @Property({ default: 'PT' })
  country: string = 'PT';

  @Property({ fieldName: 'postal_code', nullable: true })
  postalCode?: string;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at' })
  updatedAt: Date = new Date();
}
