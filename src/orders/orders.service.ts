import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SetTransactionDto } from './dto/set-transaction.dto';
import { PlaceOrderDto } from './dto/place-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOrderDto) {
    return this.prisma.order.create({ data: dto });
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { OrderAddress: { select: { firstName: true, lastName: true } } },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        OrderAddress: true,
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            size: true,
            product: {
              select: {
                title: true,
                slug: true,
                productImages: { select: { url: true }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { OrderAddress: { select: { firstName: true, lastName: true } } },
    });
  }

  async placeOrder(userId: string, dto: PlaceOrderDto) {
    const productIds = dto.items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== new Set(productIds).size) {
      throw new BadRequestException('One or more products not found');
    }

    let subtotal = 0, tax = 0, total = 0, itemsInOrder = 0;
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      const line = product.price * item.quantity;
      subtotal += line;
      tax += line * 0.15;
      total += line * 1.15;
      itemsInOrder += item.quantity;
    }

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        for (const item of dto.items) {
          const updated = await tx.product.update({
            where: { id: item.productId },
            data: { inStock: { decrement: item.quantity } },
          });
          if (updated.inStock < 0) {
            throw new BadRequestException(`${updated.title} is out of stock`);
          }
        }

        const order = await tx.order.create({
          data: {
            userId,
            itemsInOrder,
            subTotal: subtotal,
            tax,
            total,
            isPaid: false,
            OrderItem: {
              createMany: {
                data: dto.items.map((item) => ({
                  quantity: item.quantity,
                  size: item.size,
                  productId: item.productId,
                  price: products.find((p) => p.id === item.productId)!.price,
                })),
              },
            },
          },
        });

        await tx.orderAddress.create({
          data: { ...dto.address, orderId: order.id },
        });

        return order;
      });

      return { order };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException((error as Error).message);
    }
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    return this.prisma.order.update({ where: { id }, data: dto });
  }

  async setTransaction(id: string, dto: SetTransactionDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { transactionId: dto.transactionId },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.order.delete({ where: { id } });
  }
}
