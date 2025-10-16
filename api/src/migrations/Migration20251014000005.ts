import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000005 extends Migration {

  override async up(): Promise<void> {
    // Create package status enum
    this.addSql(`CREATE TYPE "package_status" AS ENUM ('active', 'inactive');`);

    // Create packages table
    this.addSql(`
      CREATE TABLE "packages" (
        "id" uuid PRIMARY KEY,
        "company_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "total_sessions" int NOT NULL,
        "validity_days" int NOT NULL,
        "status" package_status NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for packages table
    this.addSql(`CREATE INDEX "packages_company_id_index" ON "packages" ("company_id");`);
    this.addSql(`CREATE INDEX "packages_status_index" ON "packages" ("status");`);

    // Create trigger to automatically update updated_at on packages table
    this.addSql(`
      CREATE TRIGGER update_packages_updated_at
        BEFORE UPDATE ON "packages"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_packages_updated_at ON "packages";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "packages_status_index";`);
    this.addSql(`DROP INDEX IF EXISTS "packages_company_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "packages";`);

    // Drop enum type
    this.addSql(`DROP TYPE IF EXISTS "package_status";`);
  }

}
