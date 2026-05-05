import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UpsertUserAddressDto } from './dto/upsert-user-address.dto';

@ApiTags('User Addresses')
@Controller('user-addresses')
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @ApiOperation({ summary: 'Create a user address' })
  @Post()
  create(@Body() dto: CreateUserAddressDto) {
    return this.userAddressesService.create(dto);
  }

  @ApiOperation({ summary: 'Get all user addresses' })
  @Get()
  findAll() {
    return this.userAddressesService.findAll();
  }

  @ApiOperation({ summary: 'Get address for a user' })
  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.userAddressesService.findByUserId(userId);
  }

  @ApiOperation({ summary: 'Create or update address for a user' })
  @Put('user/:userId')
  upsertByUserId(@Param('userId') userId: string, @Body() dto: UpsertUserAddressDto) {
    return this.userAddressesService.upsertByUserId(userId, dto);
  }

  @ApiOperation({ summary: 'Delete address for a user' })
  @Delete('user/:userId')
  deleteByUserId(@Param('userId') userId: string) {
    return this.userAddressesService.deleteByUserId(userId);
  }

  @ApiOperation({ summary: 'Get address by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAddressesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update address by ID' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserAddressDto) {
    return this.userAddressesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete address by ID' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAddressesService.remove(id);
  }
}
