import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './testimonial.entity';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial])],
  providers: [TestimonialsService],
  controllers: [TestimonialsController],
})
export class TestimonialsModule {}
