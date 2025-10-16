import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TrainingSessionTemplatesService } from './training-session-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { CurrentCompany } from '../../common/decorators';
import { Company } from '../companies/entities/company.entity';
import { CreateTrainingSessionTemplateDto } from './dto/create-training-session-template.dto';
import { UpdateTrainingSessionTemplateDto } from './dto/update-training-session-template.dto';
import { TrainingSessionTemplateResponseDto } from './dto/training-session-template-response.dto';

@ApiTags('Training Session Templates')
@ApiBearerAuth()
@Controller('training-session-templates')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class TrainingSessionTemplatesController {
  constructor(
    private readonly trainingSessionTemplatesService: TrainingSessionTemplatesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a training session template',
    description: 'Admin can assign any trainer in the company. Trainer can only assign themselves.'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Template created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or trainer/package not found' })
  async create(
    @Body() createTemplateDto: CreateTrainingSessionTemplateDto,
    @CurrentCompany() company: Company,
  ) {
    const template = await this.trainingSessionTemplatesService.create(
      createTemplateDto,
      company,
    );

    return TrainingSessionTemplateResponseDto.fromEntity(template);
  }

  @Get()
  @ApiOperation({ summary: 'List all training session templates in the company' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Templates retrieved successfully' })
  async findAll(
    @CurrentCompany() company: Company,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const templates = await this.trainingSessionTemplatesService.findAllByCompany(
      company,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
    return templates.map(TrainingSessionTemplateResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training session template by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Template not found' })
  async findOne(@Param('id') id: string, @CurrentCompany() company: Company) {
    const template = await this.trainingSessionTemplatesService.findById(id, company);

    if (!template) {
      throw new NotFoundException('Training session template not found');
    }

    return TrainingSessionTemplateResponseDto.fromEntity(template);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a training session template' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTrainingSessionTemplateDto,
    @CurrentCompany() company: Company,
  ) {
    const template = await this.trainingSessionTemplatesService.update(id, company, {
      ...updateTemplateDto,
      startDate: updateTemplateDto.startDate ? new Date(updateTemplateDto.startDate) : undefined,
      endDate: updateTemplateDto.endDate ? new Date(updateTemplateDto.endDate) : undefined,
    });
    return TrainingSessionTemplateResponseDto.fromEntity(template);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training session template' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Template not found' })
  async remove(@Param('id') id: string, @CurrentCompany() company: Company) {
    await this.trainingSessionTemplatesService.delete(id, company);
    return { message: 'Training session template deleted successfully' };
  }
}
