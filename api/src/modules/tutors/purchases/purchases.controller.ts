import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyScopeGuard } from '../../../common/guards';
import { CurrentCompany } from '../../../common/decorators';
import { Company } from '../../companies/entities/company.entity';
import { CreatePackagePurchaseDto } from './dto/create-package-purchase.dto';
import { UpdatePackagePurchaseDto } from './dto/update-package-purchase.dto';
import { PackagePurchaseResponseDto } from './dto/package-purchase-response.dto';

@Controller('tutors/:tutorId/purchases')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  async create(
    @Param('tutorId') tutorId: string,
    @Body() createPackagePurchaseDto: CreatePackagePurchaseDto,
    @CurrentCompany() company: Company,
  ) {
    const purchase = await this.purchasesService.create(
      tutorId,
      createPackagePurchaseDto.packageId,
      company,
    );

    return PackagePurchaseResponseDto.fromEntity(purchase);
  }

  @Get()
  async findAll(
    @Param('tutorId') tutorId: string,
    @CurrentCompany() company: Company,
  ) {
    const purchases = await this.purchasesService.findByTutor(tutorId, company);
    return purchases.map(PackagePurchaseResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(
    @Param('tutorId') tutorId: string,
    @Param('id') id: string,
    @CurrentCompany() company: Company,
  ) {
    const purchase = await this.purchasesService.findById(id, tutorId, company);

    if (!purchase) {
      throw new NotFoundException('Package purchase not found');
    }

    return PackagePurchaseResponseDto.fromEntity(purchase);
  }

  @Put(':id')
  async update(
    @Param('tutorId') tutorId: string,
    @Param('id') id: string,
    @Body() updatePackagePurchaseDto: UpdatePackagePurchaseDto,
    @CurrentCompany() company: Company,
  ) {
    const purchase = await this.purchasesService.update(id, tutorId, company, updatePackagePurchaseDto);
    return PackagePurchaseResponseDto.fromEntity(purchase);
  }

  @Delete(':id')
  async remove(
    @Param('tutorId') tutorId: string,
    @Param('id') id: string,
    @CurrentCompany() company: Company,
  ) {
    await this.purchasesService.delete(id, tutorId, company);
    return { message: 'Package purchase deleted successfully' };
  }
}
