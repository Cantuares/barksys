import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000010 extends Migration {

  override async up(): Promise<void> {
    // Create trainer_availability_configs table
    this.addSql(`
      CREATE TABLE "trainer_availability_configs" (
        "id" uuid PRIMARY KEY,
        "trainer_id" uuid UNIQUE NOT NULL,
        "work_start_time" time NOT NULL,
        "work_end_time" time NOT NULL,
        "slot_duration_minutes" int NOT NULL,
        "lunch_break_start" time,
        "lunch_break_end" time,
        "break_time_start" time,
        "break_time_end" time,
        "working_days" jsonb NOT NULL DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}',
        "timezone" varchar(50) NOT NULL DEFAULT 'America/Sao_Paulo',
        "buffer_time_minutes" int,
        "max_bookings_per_day" int,
        "advance_booking_days" int DEFAULT 30,
        "min_notice_hours" int DEFAULT 24,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("trainer_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT "chk_work_hours" CHECK ("work_start_time" < "work_end_time"),
        CONSTRAINT "chk_slot_duration" CHECK ("slot_duration_minutes" > 0 AND "slot_duration_minutes" <= 480),
        CONSTRAINT "chk_lunch_hours" CHECK (
          ("lunch_break_start" IS NULL AND "lunch_break_end" IS NULL) OR
          ("lunch_break_start" IS NOT NULL AND "lunch_break_end" IS NOT NULL AND "lunch_break_start" < "lunch_break_end")
        ),
        CONSTRAINT "chk_break_hours" CHECK (
          ("break_time_start" IS NULL AND "break_time_end" IS NULL) OR
          ("break_time_start" IS NOT NULL AND "break_time_end" IS NOT NULL AND "break_time_start" < "break_time_end")
        )
      );
    `);

    // Create indexes for trainer_availability_configs table
    this.addSql(`CREATE INDEX "trainer_availability_configs_trainer_id_index" ON "trainer_availability_configs" ("trainer_id");`);
    this.addSql(`CREATE INDEX "trainer_availability_configs_is_active_index" ON "trainer_availability_configs" ("is_active");`);

    // Create trigger to automatically update updated_at on trainer_availability_configs table
    this.addSql(`
      CREATE TRIGGER update_trainer_availability_configs_updated_at
        BEFORE UPDATE ON "trainer_availability_configs"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_trainer_availability_configs_updated_at ON "trainer_availability_configs";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "trainer_availability_configs_is_active_index";`);
    this.addSql(`DROP INDEX IF EXISTS "trainer_availability_configs_trainer_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "trainer_availability_configs";`);
  }

}
