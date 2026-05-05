import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { UsersModule } from './users/users.module';
import { CountriesModule } from './countries/countries.module';
import { UserAddressesModule } from './user-addresses/user-addresses.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrderAddressesModule } from './order-addresses/order-addresses.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ProductImagesModule,
    UsersModule,
    CountriesModule,
    UserAddressesModule,
    OrdersModule,
    OrderItemsModule,
    OrderAddressesModule,
    PaymentsModule,
  ],
})
export class AppModule {}
