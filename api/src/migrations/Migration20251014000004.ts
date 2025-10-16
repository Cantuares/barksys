import { Migration } from '@mikro-orm/migrations';

export class Migration20251014000004 extends Migration {

  override async up(): Promise<void> {
    // Create pet species enum
    this.addSql(`CREATE TYPE "pet_species" AS ENUM ('dog', 'other');`);

    // Create pet status enum
    this.addSql(`CREATE TYPE "pet_status" AS ENUM ('active', 'inactive');`);

    // Create pets table
    this.addSql(`
      CREATE TABLE "pets" (
        "id" uuid PRIMARY KEY,
        "tutor_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "species" pet_species NOT NULL DEFAULT 'dog',
        "breed" varchar(255),
        "birth" date,
        "weight" decimal(10,2),
        "description" text,
        "status" pet_status NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        FOREIGN KEY ("tutor_id") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Create indexes for pets table
    this.addSql(`CREATE INDEX "pets_tutor_id_index" ON "pets" ("tutor_id");`);
    this.addSql(`CREATE INDEX "pets_status_index" ON "pets" ("status");`);

    // Create trigger to automatically update updated_at on pets table
    this.addSql(`
      CREATE TRIGGER update_pets_updated_at
        BEFORE UPDATE ON "pets"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  override async down(): Promise<void> {
    // Drop trigger
    this.addSql(`DROP TRIGGER IF EXISTS update_pets_updated_at ON "pets";`);

    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "pets_status_index";`);
    this.addSql(`DROP INDEX IF EXISTS "pets_tutor_id_index";`);

    // Drop table
    this.addSql(`DROP TABLE IF EXISTS "pets";`);

    // Drop enum types
    this.addSql(`DROP TYPE IF EXISTS "pet_status";`);
    this.addSql(`DROP TYPE IF EXISTS "pet_species";`);
  }

}
