import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000007 extends Migration {

  override async up(): Promise<void> {
    // Create recurrence enum
    this.addSql(`CREATE TYPE "recurrence" AS ENUM ('once', 'daily', 'weekly', 'monthly');`);

    // Create template status enum
    this.addSql(`CREATE TYPE "template_status" AS ENUM ('active', 'inactive');`);

    // Create training_session_templates table
    this.addSql(`
      CREATE TABLE "training_session_templates" (
        "id" uuid PRIMARY KEY,
        "package_id" uuid NOT NULL,
        "trainer_id" uuid NOT NULL,
        "start_time" varchar(10) NOT NULL,
        "end_time" varchar(10) NOT NULL,
        "max_participants" int NOT NULL DEFAULT 1,
        "recurrence" recurrence NOT NULL DEFAULT 'weekly',
        "weekdays" jsonb,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "status" template_status NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY ("trainer_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for training_session_templates table
    this.addSql(`CREATE INDEX "training_session_templates_package_id_index" ON "training_session_templates" ("package_id");`);
    this.addSql(`CREATE INDEX "training_session_templates_trainer_id_index" ON "training_session_templates" ("trainer_id");`);
    this.addSql(`CREATE INDEX "training_session_templates_status_index" ON "training_session_templates" ("status");`);
    this.addSql(`CREATE INDEX "training_session_templates_start_date_index" ON "training_session_templates" ("start_date");`);

    // Create trigger to automatically update updated_at on training_session_templates table
    this.addSql(`
      CREATE TRIGGER update_training_session_templates_updated_at
        BEFORE UPDATE ON "training_session_templates"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_training_session_templates_updated_at ON "training_session_templates";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "training_session_templates_start_date_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_templates_status_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_templates_trainer_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_templates_package_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "training_session_templates";`);

    // Drop enum types
    this.addSql(`DROP TYPE IF EXISTS "template_status";`);
    this.addSql(`DROP TYPE IF EXISTS "recurrence";`);
  }

}
