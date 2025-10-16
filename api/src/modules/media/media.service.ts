import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService {
  constructor(private readonly em: EntityManager) {}

  async create(mediaData: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url?: string;
    alt: string;
    width?: number;
    height?: number;
  }): Promise<Media> {
    const media = this.em.create(Media, {
      ...mediaData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(media);
    return media;
  }

  async findById(id: string): Promise<Media | null> {
    return this.em.findOne(Media, { id });
  }

  async findAll(limit = 50, offset = 0): Promise<Media[]> {
    return this.em.find(Media, {}, { limit, offset, orderBy: { createdAt: 'DESC' } });
  }

  async delete(id: string): Promise<void> {
    const media = await this.findById(id);
    if (media) {
      await this.em.removeAndFlush(media);
    }
  }
}
