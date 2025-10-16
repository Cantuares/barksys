import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

@Entity({ tableName: 'media' })
export class Media {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property({ type: 'varchar', length: 255 })
  filename: string;

  @Property({ type: 'varchar', length: 255 })
  originalName: string;

  @Property({ type: 'varchar', length: 100 })
  mimeType: string;

  @Property({ type: 'int' })
  size: number;

  @Property({ type: 'varchar', length: 500 })
  path: string;

  @Property({ type: 'varchar', length: 500, nullable: true })
  url?: string;

  @Property({ type: 'varchar', length: 255 })
  alt: string;

  @Property({ type: 'int', nullable: true })
  width?: number;

  @Property({ type: 'int', nullable: true })
  height?: number;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
