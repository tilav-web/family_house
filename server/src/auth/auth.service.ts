import { Injectable, BadRequestException } from '@nestjs/common';
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

  async changeCredentials(
    adminId: string,
    currentPassword: string,
    newUsername?: string,
    newPassword?: string,
  ) {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new BadRequestException('Admin topilmadi');
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Joriy parol noto\'g\'ri');
    }

    if (newUsername) {
      const existing = await this.adminRepository.findOne({
        where: { username: newUsername },
      });
      if (existing && existing.id !== adminId) {
        throw new BadRequestException('Bu username allaqachon band');
      }
      admin.username = newUsername;
    }

    if (newPassword) {
      admin.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await this.adminRepository.save(admin);

    // Yangi token qaytarish (username o'zgargan bo'lishi mumkin)
    return this.login(admin);
  }
}
