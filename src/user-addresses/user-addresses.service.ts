import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UpsertUserAddressDto } from './dto/upsert-user-address.dto';

@Injectable()
export class UserAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserAddressDto) {
    return this.prisma.userAddress.create({ data: dto });
  }

  findAll() {
    return this.prisma.userAddress.findMany();
  }

  async findOne(id: string) {
    const address = await this.prisma.userAddress.findUnique({ where: { id } });
    if (!address) throw new NotFoundException(`UserAddress ${id} not found`);
    return address;
  }

  findByUserId(userId: string) {
    return this.prisma.userAddress.findUnique({ where: { userId } });
  }

  upsertByUserId(userId: string, dto: UpsertUserAddressDto) {
    return this.prisma.userAddress.upsert({
      where: { userId },
      update: dto,
      create: { ...dto, userId },
    });
  }

  async deleteByUserId(userId: string) {
    const address = await this.prisma.userAddress.findUnique({ where: { userId } });
    if (!address) throw new NotFoundException(`UserAddress for user ${userId} not found`);
    return this.prisma.userAddress.delete({ where: { userId } });
  }

  async update(id: string, dto: UpdateUserAddressDto) {
    await this.findOne(id);
    return this.prisma.userAddress.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.userAddress.delete({ where: { id } });
  }
}
