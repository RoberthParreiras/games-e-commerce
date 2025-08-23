import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ImageService {
  private readonly imageServiceUrl: string;
  private readonly logger = new Logger(ImageService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.imageServiceUrl = this.configService.get<string>(
      'IMAGE_MICROSSERVICE_URL',
    )!;
  }

  async create(params: {
    authorization: string;
    file: Express.Multer.File;
  }): Promise<any> {
    const { authorization, file } = params;
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ url: string }>(
          `${this.imageServiceUrl}/image/upload/`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: authorization,
            },
          },
        ),
      );

      return response.data.url;
    } catch (error) {
      this.logger.error(
        `Failed to upload image. Status: ${error.response?.status}`,
        error.response?.data,
      );
      throw error;
    }
  }
}
