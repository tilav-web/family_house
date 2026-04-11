import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('api/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Get('admin')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isRead') isRead?: string,
  ) {
    let isReadFilter: boolean | undefined = undefined;
    if (isRead === 'true') isReadFilter = true;
    if (isRead === 'false') isReadFilter = false;

    return this.contactsService.findAll(page, limit, isReadFilter);
  }

  @Get('admin/:id')
  async findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch('admin/:id/read')
  async markAsRead(@Param('id') id: string) {
    return this.contactsService.markAsRead(id);
  }

  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    await this.contactsService.remove(id);
    return { message: 'Contact deleted successfully' };
  }
}
