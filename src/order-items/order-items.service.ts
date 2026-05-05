import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrderItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOrderItemDto) {
    return this.prisma.orderItem.create({ data: dto });
  }

  findAll() {
    return this.prisma.orderItem.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`OrderItem ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateOrderItemDto) {
    await this.findOne(id);
    return this.prisma.orderItem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.orderItem.delete({ where: { id } });
  }
}
