import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../config/configuration';
import { Admin } from '../admin/admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async validateAdmin(
    username: string,
    password: string,
  ): Promise<Admin | null> {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
      return admin;
    }
    return null;
  }

  login(admin: Admin) {
    const jwtConfig = this.configService.getOrThrow<AppConfig['jwt']>('jwt');
    const payload = { sub: admin.id, username: admin.username };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: jwtConfig.expiresIn,
      }),
    };
  }

  async getMe(adminId: string) {
    return this.adminRepository.findOne({ where: { id: adminId } });
  }
}
