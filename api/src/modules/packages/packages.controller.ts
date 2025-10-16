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
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { CurrentCompany } from '../../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageResponseDto } from './dto/package-response.dto';

@Controller('packages')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createPackageDto: CreatePackageDto,
    @CurrentCompany() company: Company,
  ) {
    const pkg = await this.packagesService.create({
      company,
      ...createPackageDto,
    });

    return PackageResponseDto.fromEntity(pkg);
  }

  @Get()
  async findAll(
    @CurrentCompany() company: Company,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const packages = await this.packagesService.findAllByCompany(
      company,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
    return packages.map(PackageResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentCompany() company: Company) {
    const pkg = await this.packagesService.findById(id, company);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return PackageResponseDto.fromEntity(pkg);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @CurrentCompany() company: Company,
  ) {
    const pkg = await this.packagesService.update(id, company, updatePackageDto);
    return PackageResponseDto.fromEntity(pkg);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentCompany() company: Company) {
    await this.packagesService.delete(id, company);
    return { message: 'Package deleted successfully' };
  }
}
