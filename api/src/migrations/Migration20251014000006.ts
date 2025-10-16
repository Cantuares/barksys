import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000006 extends Migration {

  override async up(): Promise<void> {
    // Create purchase status enum
    this.addSql(`CREATE TYPE "purchase_status" AS ENUM ('active', 'expired', 'used');`);

    // Create package_purchases table
    this.addSql(`
      CREATE TABLE "package_purchases" (
        "id" uuid PRIMARY KEY,
        "tutor_id" uuid NOT NULL,
        "package_id" uuid NOT NULL,
        "purchase_date" timestamptz NOT NULL,
        "used_sessions" int NOT NULL DEFAULT 0,
        "status" purchase_status NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("tutor_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for package_purchases table
    this.addSql(`CREATE INDEX "package_purchases_tutor_id_index" ON "package_purchases" ("tutor_id");`);
    this.addSql(`CREATE INDEX "package_purchases_package_id_index" ON "package_purchases" ("package_id");`);
    this.addSql(`CREATE INDEX "package_purchases_status_index" ON "package_purchases" ("status");`);

    // Create trigger to automatically update updated_at on package_purchases table
    this.addSql(`
      CREATE TRIGGER update_package_purchases_updated_at
        BEFORE UPDATE ON "package_purchases"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_package_purchases_updated_at ON "package_purchases";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "package_purchases_status_index";`);
    this.addSql(`DROP INDEX IF EXISTS "package_purchases_package_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "package_purchases_tutor_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "package_purchases";`);

    // Drop enum type
    this.addSql(`DROP TYPE IF EXISTS "purchase_status";`);
  }

}
