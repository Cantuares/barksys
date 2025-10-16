import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Media])],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
