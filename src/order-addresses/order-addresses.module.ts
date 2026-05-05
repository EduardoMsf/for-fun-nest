import { Module } from '@nestjs/common';
import { OrderAddressesService } from './order-addresses.service';
import { OrderAddressesController } from './order-addresses.controller';

@Module({
  controllers: [OrderAddressesController],
  providers: [OrderAddressesService],
})
export class OrderAddressesModule {}
