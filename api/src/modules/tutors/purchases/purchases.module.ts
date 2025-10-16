import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PackagePurchase } from './entities/package-purchase.entity';

@Module({
  imports: [MikroOrmModule.forFeature([PackagePurchase])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
