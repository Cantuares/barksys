import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../modules/auth/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Internationalization')
@Controller('locales')
export class I18nController {
  private readonly localesPath = path.join(__dirname, '../../i18n/locales/');

  @Public()
  @Get(':lng/:ns.json')
  @ApiOperation({
    summary: 'Get translation file for a specific language and namespace',
    description: 'Public endpoint compatible with i18next-http-backend. Returns translation JSON file.'
  })
  @ApiParam({
    name: 'lng',
    description: 'Language code (e.g., en, pt)',
    example: 'en',
  })
  @ApiParam({
    name: 'ns',
    description: 'Namespace (e.g., auth, common)',
    example: 'auth',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Translation file retrieved successfully',
    schema: {
      type: 'object',
      example: {
        register: {
          success: 'User registered successfully. Please verify your email.',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Translation file not found' })
  async getTranslations(
    @Param('lng') lng: string,
    @Param('ns') ns: string,
    @Res() res: any,
  ) {
    try {
      const filePath = path.join(this.localesPath, lng, `${ns}.json`);

      // Security: prevent path traversal
      if (!filePath.startsWith(this.localesPath)) {
        return res.status(HttpStatus.FORBIDDEN).send({ error: 'Forbidden' });
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).send({ error: 'Translation file not found' });
      }

      // Read and send file
      const content = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(content);

      return res
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
        .send(translations);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Error loading translations' });
    }
  }
}
