import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Gender } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async findAll({ gender, page = 1, take = 12 }: { gender?: Gender; page?: number; take?: number } = {}) {
    const where = gender ? { gender } : {};
    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        take,
        skip: (page - 1) * take,
        where,
        include: { productImages: { take: 2, select: { url: true, id: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      currentPage: page,
      totalPages: Math.ceil(totalCount / take),
      products: products.map(({ productImages, size, ...rest }) => ({
        ...rest,
        images: productImages,
        sizes: size,
      })),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productImages: true, category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug },
      include: { productImages: { select: { url: true, id: true } } },
    });
    if (!product) throw new NotFoundException(`Product with slug "${slug}" not found`);
    const { productImages, size, ...rest } = product;
    return { ...rest, images: productImages, sizes: size };
  }

  async getStockBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug },
      select: { inStock: true },
    });
    if (!product) throw new NotFoundException(`Product with slug "${slug}" not found`);
    return { inStock: product.inStock };
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
