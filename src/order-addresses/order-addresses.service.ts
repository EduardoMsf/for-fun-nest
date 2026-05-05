import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderAddressDto } from './dto/create-order-address.dto';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';

@Injectable()
export class OrderAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOrderAddressDto) {
    return this.prisma.orderAddress.create({ data: dto });
  }

  findAll() {
    return this.prisma.orderAddress.findMany();
  }

  async findOne(id: string) {
    const address = await this.prisma.orderAddress.findUnique({ where: { id } });
    if (!address) throw new NotFoundException(`OrderAddress ${id} not found`);
    return address;
  }

  async update(id: string, dto: UpdateOrderAddressDto) {
    await this.findOne(id);
    return this.prisma.orderAddress.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.orderAddress.delete({ where: { id } });
  }
}
