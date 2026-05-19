import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OfficialsModule } from './officials/officials.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    OfficialsModule,
  ],
})
export class AppModule {}