import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('admin')
  async findAllAdmin() {
    return this.servicesService.findAll(true);
  }

  @Get('admin/:id')
  async findOneAdmin(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Public()
  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post('admin')
  async create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    await this.servicesService.remove(id);
    return { message: 'Service deleted successfully' };
  }

  @Patch('admin/reorder')
  async reorder(@Body() { ids }: { ids: string[] }) {
    await this.servicesService.reorder(ids);
    return { message: 'Services reordered successfully' };
  }
}
