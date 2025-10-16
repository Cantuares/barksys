import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000009 extends Migration {

  override async up(): Promise<void> {
    // Create enrollment status enum
    this.addSql(`CREATE TYPE "enrollment_status" AS ENUM ('pending', 'enrolled', 'confirmed', 'checked_in', 'cancelled', 'no_show');`);

    // Create training_session_enrollments table
    this.addSql(`
      CREATE TABLE "training_session_enrollments" (
        "id" uuid PRIMARY KEY,
        "training_session_id" uuid NOT NULL,
        "tutor_id" uuid NOT NULL,
        "pet_id" uuid NOT NULL,
        "enrollment_date" timestamptz NOT NULL,
        "status" enrollment_status NOT NULL DEFAULT 'enrolled',
        "confirmation_token" uuid UNIQUE NOT NULL,
        "cancellation_token" uuid UNIQUE NOT NULL,
        "cancellation_reason" text,
        "confirmed_at" timestamptz,
        "checked_in_at" timestamptz,
        "no_show_at" timestamptz,
        "cancelled_at" timestamptz,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("training_session_id") REFERENCES "training_sessions" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY ("tutor_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY ("pet_id") REFERENCES "pets" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for training_session_enrollments table
    this.addSql(`CREATE INDEX "training_session_enrollments_training_session_id_index" ON "training_session_enrollments" ("training_session_id");`);
    this.addSql(`CREATE INDEX "training_session_enrollments_tutor_id_index" ON "training_session_enrollments" ("tutor_id");`);
    this.addSql(`CREATE INDEX "training_session_enrollments_pet_id_index" ON "training_session_enrollments" ("pet_id");`);
    this.addSql(`CREATE INDEX "training_session_enrollments_status_index" ON "training_session_enrollments" ("status");`);
    this.addSql(`CREATE INDEX "training_session_enrollments_confirmation_token_index" ON "training_session_enrollments" ("confirmation_token");`);
    this.addSql(`CREATE INDEX "training_session_enrollments_cancellation_token_index" ON "training_session_enrollments" ("cancellation_token");`);

    // Create trigger to automatically update updated_at on training_session_enrollments table
    this.addSql(`
      CREATE TRIGGER update_training_session_enrollments_updated_at
        BEFORE UPDATE ON "training_session_enrollments"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_training_session_enrollments_updated_at ON "training_session_enrollments";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "training_session_enrollments_cancellation_token_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_enrollments_confirmation_token_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_enrollments_status_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_enrollments_pet_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_enrollments_tutor_id_index";`);
    this.addSql(`DROP INDEX IF EXISTS "training_session_enrollments_training_session_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "training_session_enrollments";`);

    // Drop enum type
    this.addSql(`DROP TYPE IF EXISTS "enrollment_status";`);
  }

}
