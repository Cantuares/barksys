import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000011 extends Migration {

  override async up(): Promise<void> {
    // Create exception type enum
    this.addSql(`CREATE TYPE "exception_type" AS ENUM ('blocked', 'custom_hours');`);

    // Create trainer_availability_exceptions table
    this.addSql(`
      CREATE TABLE "trainer_availability_exceptions" (
        "id" uuid PRIMARY KEY,
        "trainer_id" uuid NOT NULL,
        "exception_date" date NOT NULL,
        "exception_type" exception_type NOT NULL,
        "custom_start_time" time,
        "custom_end_time" time,
        "reason" text,
        "created_at" timestamptz NOT NULL,
        FOREIGN KEY ("trainer_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT "chk_custom_hours" CHECK (
          ("exception_type" = 'custom_hours' AND "custom_start_time" IS NOT NULL AND "custom_end_time" IS NOT NULL AND "custom_start_time" < "custom_end_time") OR
          ("exception_type" = 'blocked')
        ),
        UNIQUE ("trainer_id", "exception_date")
      );
    `);

    // Create indexes for trainer_availability_exceptions table
    this.addSql(`CREATE INDEX "trainer_availability_exceptions_trainer_id_index" ON "trainer_availability_exceptions" ("trainer_id");`);
    this.addSql(`CREATE INDEX "trainer_availability_exceptions_exception_date_index" ON "trainer_availability_exceptions" ("exception_date");`);
    this.addSql(`CREATE INDEX "trainer_availability_exceptions_trainer_date_index" ON "trainer_availability_exceptions" ("trainer_id", "exception_date");`);
  }

  override async down(): Promise<void> {
    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "trainer_availability_exceptions_trainer_date_index";`);
    this.addSql(`DROP INDEX IF EXISTS "trainer_availability_exceptions_exception_date_index";`);
    this.addSql(`DROP INDEX IF EXISTS "trainer_availability_exceptions_trainer_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "trainer_availability_exceptions";`);

    // Drop enum type
    this.addSql(`DROP TYPE IF EXISTS "exception_type";`);
  }

}
