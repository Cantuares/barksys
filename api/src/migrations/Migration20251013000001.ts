import { Migration } from '@mikro-orm/migrations';

export class Migration20251013000001 extends Migration {

  override async up(): Promise<void> {
    // Create tax type enum
    this.addSql(`CREATE TYPE "tax_type" AS ENUM ('nif', 'vat', 'nipc');`);

    // Create companies table
    this.addSql(`
      CREATE TABLE "companies" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) UNIQUE NOT NULL,
        "tax_id" varchar(50) UNIQUE NOT NULL,
        "tax_type" tax_type NOT NULL,
        "billing_address" text NOT NULL,
        "city" varchar(100) NOT NULL,
        "country" varchar(2) NOT NULL DEFAULT 'PT',
        "postal_code" varchar(20),
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for companies table
    this.addSql(`CREATE INDEX "companies_user_id_index" ON "companies" ("user_id");`);
    this.addSql(`CREATE INDEX "companies_email_index" ON "companies" ("email");`);
    this.addSql(`CREATE INDEX "companies_tax_id_index" ON "companies" ("tax_id");`);

    // Create trigger to automatically update updated_at on companies table
    this.addSql(`
      CREATE TRIGGER update_companies_updated_at
        BEFORE UPDATE ON "companies"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_companies_updated_at ON "companies";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "companies_tax_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "companies_email_index";`);
    this.addSql(`DROP INDEX IF EXISTS "companies_user_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "companies";`);

    // Drop enum type
    this.addSql(`DROP TYPE IF EXISTS "tax_type";`);
  }

}
