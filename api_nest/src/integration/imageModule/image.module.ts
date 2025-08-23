import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ImageService } from './image.service';

@Module({
  imports: [HttpModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
