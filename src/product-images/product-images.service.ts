import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductImageDto) {
    return this.prisma.productImage.create({ data: dto });
  }

  findAll() {
    return this.prisma.productImage.findMany();
  }

  async findOne(id: number) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException(`ProductImage ${id} not found`);
    return image;
  }

  async update(id: number, dto: UpdateProductImageDto) {
    await this.findOne(id);
    return this.prisma.productImage.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.productImage.delete({
      where: { id },
      include: { product: { select: { slug: true } } },
    });
  }
}
