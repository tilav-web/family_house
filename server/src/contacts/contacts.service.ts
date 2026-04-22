import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BotService } from '../bot/bot.service';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly botService: BotService,
  ) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(dto);
    const saved = await this.contactRepository.save(contact);

    void this.botService.sendMessageToChannel(this.formatContactMessage(saved));

    return saved;
  }

  private formatContactMessage(contact: Contact): string {
    const escape = (value: string): string =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const lines = [
      '<b>📬 Yangi murojaat</b>',
      `<b>Ism:</b> ${escape(contact.name)}`,
      `<b>Telefon:</b> ${escape(contact.phone)}`,
    ];
    if (contact.email) {
      lines.push(`<b>Email:</b> ${escape(contact.email)}`);
    }
    lines.push(`<b>Til:</b> ${escape(contact.language)}`);
    lines.push('');
    lines.push(`<b>Xabar:</b>\n${escape(contact.message)}`);

    return lines.join('\n');
  }

  async findAll(page: number = 1, limit: number = 10, isRead?: boolean) {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Contact> =
      isRead === undefined ? {} : { isRead };

    const [items, total] = await this.contactRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact with id ${id} not found`);
    }
    return contact;
  }

  async markAsRead(id: string): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.isRead = true;
    return this.contactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.remove(contact);
  }
}
