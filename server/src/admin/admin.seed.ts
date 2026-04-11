import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../config/configuration';
import { Admin } from './admin.entity';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async onApplicationBootstrap() {
    const adminCount = await this.adminRepository.count();
    if (adminCount > 0) {
      return;
    }

    const adminConfig =
      this.configService.getOrThrow<AppConfig['admin']>('admin');
    const passwordHash = await bcrypt.hash(adminConfig.password, 10);

    const admin = this.adminRepository.create({
      username: adminConfig.username,
      passwordHash,
    });

    await this.adminRepository.save(admin);
    this.logger.log(`Default admin created: ${adminConfig.username}`);
  }
}
