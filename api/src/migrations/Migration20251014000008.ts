import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000008 extends Migration {

  override async up(): Promise<void> {
    // Create training session status enum
    this.addSql(`CREATE TYPE "training_session_status" AS ENUM ('active', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired', 'no_show');`);

    // Create training_sessions table
    this.addSql(`
      CREATE TABLE "training_sessions" (
        "id" uuid PRIMARY KEY,
        "training_session_key" uuid UNIQUE NOT NULL,
        "template_id" uuid,
        "package_id" uuid NOT NULL,
        "trainer_id" uuid NOT NULL,
        "date" date NOT NULL,
        "start_time" varchar(10) NOT NULL,
        "end_time" varchar(10) NOT NULL,
        "max_participants" int NOT NULL DEFAULT 1,
        "available_slots" int NOT NULL DEFAULT 1,
        "status" training_session_status NOT NULL DEFAULT 'active',
        "notes" text,
        "scheduled_at" timestamptz,
        "confirmed_at" timestamptz,
        "in_progress_at" timestamptz,
        "completed_at" timestamptz,
        "no_show_at" timestamptz,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("template_id") REFERENCES "training_session_templates" ("id") ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY ("trainer_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for training_sessions table
    this.addSql(`CREATE INDEX "training_sessions_training_session_key_index" ON "training_sessions" ("training_session_key");`);
    this.addSql(`CREATE INDEX "training_sessions_template_id_index" ON "training_sessions" ("template_id");`);
    this.addSql(`CREATE INDEX "training_sessions_package_id_index" ON "training_sessions" ("package_id");`);
    this.addSql(`CREATE INDEX "training_sessions_trainer_id_index" ON "training_sessions" ("trainer_id");`);
    this.addSql(`CREATE INDEX "training_sessions_date_index" ON "training_sessions" ("date");`);
    this.addSql(`CREATE INDEX "training_sessions_status_index" ON "training_sessions" ("status");`);

    // Create trigger to automatically update updated_at on training_sessions table
    this.addSql(`
      CREATE TRIGGER update_training_sessions_updated_at
        BEFORE UPDATE ON "training_sessions"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_training_sessions_updated_at ON "training_sessions";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "training_sessions_status_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_sessions_date_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_sessions_trainer_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_sessions_package_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_sessions_template_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_sessions_training_session_key_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "training_sessions";`);

    // Drop enum type
    this.addSql(`DROP TYPE IF EXISTS "training_session_status";`);
  }

}
