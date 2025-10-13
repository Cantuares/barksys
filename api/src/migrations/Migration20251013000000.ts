import { Migration } from '@mikro-orm/migrations';

export class Migration20251013000000 extends Migration {

  override async up(): Promise<void> {
    // Create user role enum type
    this.addSql(`CREATE TYPE "user_role" AS ENUM ('admin', 'trainer', 'tutor');`);

    // Create users table
    this.addSql(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY,
        "email" varchar(255) UNIQUE NOT NULL,
        "full_name" varchar(255) NOT NULL,
        "role" user_role NOT NULL DEFAULT 'admin',
        "is_active" boolean NOT NULL DEFAULT false,
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "email_verification_token" varchar(255),
        "email_verification_token_expires_at" timestamptz,
        "password_hash" varchar(255) NOT NULL,
        "password_reset_token" varchar(255),
        "password_reset_token_expires_at" timestamptz,
        "password_changed_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z',
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL
      );
    `);

    // Create indexes for users table
    this.addSql(`CREATE INDEX "users_email_index" ON "users" ("email");`);

    // Create sessions table
    this.addSql(`
      CREATE TABLE "sessions" (
        "id" uuid PRIMARY KEY,
        "email" varchar(255) NOT NULL,
        "refresh_token" varchar(255) NOT NULL,
        "user_agent" varchar(255) NOT NULL,
        "client_ip" varchar(255) NOT NULL,
        "is_blocked" boolean NOT NULL DEFAULT false,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL,
        FOREIGN KEY ("email") REFERENCES "users" ("email") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for sessions table
    this.addSql(`CREATE INDEX "sessions_email_index" ON "sessions" ("email");`);
    this.addSql(`CREATE INDEX "sessions_refresh_token_index" ON "sessions" ("refresh_token");`);
    this.addSql(`CREATE INDEX "sessions_expires_at_index" ON "sessions" ("expires_at");`);

    // Create notifications table
    this.addSql(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid,
        "channel" text CHECK ("channel" IN ('email', 'sms', 'push')) NOT NULL DEFAULT 'email',
        "recipient" varchar(255) NOT NULL,
        "subject" varchar(500),
        "template_name" varchar(100) NOT NULL,
        "template_context" jsonb,
        "status" text CHECK ("status" IN ('pending', 'sent', 'failed', 'delivered')) NOT NULL DEFAULT 'pending',
        "error_message" text,
        "sent_at" timestamptz,
        "delivered_at" timestamptz,
        "read" boolean,
        "read_at" timestamptz,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL
      );
    `);

    // Create indexes for notifications table
    this.addSql(`CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id");`);
    this.addSql(`CREATE INDEX "idx_notifications_channel" ON "notifications" ("channel");`);
    this.addSql(`CREATE INDEX "idx_notifications_recipient" ON "notifications" ("recipient");`);
    this.addSql(`CREATE INDEX "idx_notifications_status" ON "notifications" ("status");`);
    this.addSql(`CREATE INDEX "idx_notifications_created_at" ON "notifications" ("created_at");`);
    this.addSql(`CREATE INDEX "idx_notifications_sent_at" ON "notifications" ("sent_at");`);
    this.addSql(`CREATE INDEX "idx_notifications_read" ON "notifications" ("read");`);

    // Create function to update updated_at column
    this.addSql(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger to automatically update updated_at on users table
    this.addSql(`
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON "users"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_users_updated_at ON "users";`);

    // Drop function
    this.addSql(`DROP FUNCTION IF EXISTS update_updated_at_column();`);

    // Drop indexes for notifications table
    this.addSql(`DROP INDEX IF EXISTS "idx_notifications_read";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_notifications_sent_at";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_notifications_created_at";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_notifications_status";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_notifications_recipient";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_notifications_channel";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_notifications_user_id";`);

    // Drop indexes for sessions table
    this.addSql(`DROP INDEX IF EXISTS "sessions_expires_at_index";`);
    this.addSql(`DROP INDEX IF EXISTS "sessions_refresh_token_index";`);
    this.addSql(`DROP INDEX IF EXISTS "sessions_email_index";`);

    // Drop indexes for users table
    this.addSql(`DROP INDEX IF EXISTS "users_email_index";`);

    // Drop tables (in correct order)
    this.addSql(`DROP TABLE IF EXISTS "notifications";`);
    this.addSql(`DROP TABLE IF EXISTS "sessions";`);
    this.addSql(`DROP TABLE IF EXISTS "users";`);

    // Drop enum type
    this.addSql(`DROP TYPE IF EXISTS "user_role";`);
  }

}
