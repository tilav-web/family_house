import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { AdminSeeder } from './admin.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [AdminSeeder],
  exports: [TypeOrmModule],
})
export class AdminModule {}
