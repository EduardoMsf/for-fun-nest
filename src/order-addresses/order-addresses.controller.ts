import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderAddressesService } from './order-addresses.service';
import { CreateOrderAddressDto } from './dto/create-order-address.dto';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';

@Controller('order-addresses')
export class OrderAddressesController {
  constructor(private readonly orderAddressesService: OrderAddressesService) {}

  @Post()
  create(@Body() dto: CreateOrderAddressDto) {
    return this.orderAddressesService.create(dto);
  }

  @Get()
  findAll() {
    return this.orderAddressesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderAddressesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderAddressDto) {
    return this.orderAddressesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderAddressesService.remove(id);
  }
}
