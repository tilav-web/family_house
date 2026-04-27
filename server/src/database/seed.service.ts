import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelInfo } from '../hotel-info/hotel-info.entity';
import { Service } from '../services/service.entity';
import { Room } from '../rooms/entities/room.entity';
import { News } from '../news/news.entity';
import { Testimonial } from '../testimonials/testimonial.entity';
import { Video } from '../videos/video.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(HotelInfo)
    private readonly hotelInfoRepo: Repository<HotelInfo>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepo: Repository<Testimonial>,
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
  ) {}

  async onApplicationBootstrap() {
    try {
      const hotelInfoCount = await this.hotelInfoRepo.count();
      if (hotelInfoCount > 0) {
        this.logger.log('Database already has data, skipping seed');
        return;
      }

      this.logger.log('Seeding database with mock data...');

      await this.seedHotelInfo();
      await this.seedServices();
      await this.seedRooms();
      await this.seedNews();
      await this.seedTestimonials();
      await this.seedVideos();

      this.logger.log('Database seeding completed!');
    } catch (error) {
      this.logger.error('Seeding failed:', error);
    }
  }

  private async seedHotelInfo() {
    const hotelInfo = new HotelInfo();
    hotelInfo.description = {
      uz: "Family House — Toshkent shahrining markazida joylashgan zamonaviy oilaviy mehmonxona. Biz mehmonlarimizga uy qulayligini va mehmonxona xizmatining eng yaxshi tomonlarini taqdim etamiz. Bizning mehmonxonamiz 2020-yilda ochilgan bo'lib, o'shandan beri minglab mehmonlarga xizmat ko'rsatib kelmoqda.",
      ru: 'Family House — современная семейная гостиница в центре Ташкента. Мы предлагаем нашим гостям домашний уют и лучший гостиничный сервис. Наш отель открылся в 2020 году и с тех пор обслужил тысячи гостей.',
      en: 'Family House is a modern family hotel in the heart of Tashkent. We offer our guests home comfort and the best hotel service. Our hotel opened in 2020 and has served thousands of guests since then.',
    };
    hotelInfo.heroText = {
      uz: 'Family House',
      ru: 'Family House',
      en: 'Family House',
    };
    hotelInfo.heroSubtext = {
      uz: 'Toshkent markazida qulay va zamonaviy mehmonxona',
      ru: 'Уютная и современная гостиница в центре Ташкента',
      en: 'Cozy and modern hotel in the heart of Tashkent',
    };
    await this.hotelInfoRepo.save(hotelInfo);
    this.logger.log('  ✓ Hotel info seeded');
  }

  private async seedServices() {
    const services = [
      {
        iconName: 'Wifi',
        title: {
          uz: 'Bepul Wi-Fi',
          ru: 'Бесплатный Wi-Fi',
          en: 'Free Wi-Fi',
        },
        description: {
          uz: 'Barcha xonalar va umumiy joylarda tezkor internet aloqasi mavjud.',
          ru: 'Быстрый интернет доступен во всех номерах и общественных зонах.',
          en: 'Fast internet access available in all rooms and public areas.',
        },
        order: 1,
      },
      {
        iconName: 'UtensilsCrossed',
        title: {
          uz: 'Restoran',
          ru: 'Ресторан',
          en: 'Restaurant',
        },
        description: {
          uz: 'Milliy va yevropa taomlari bilan nonushta, tushlik va kechki ovqat.',
          ru: 'Завтрак, обед и ужин с национальными и европейскими блюдами.',
          en: 'Breakfast, lunch and dinner with national and European cuisine.',
        },
        order: 2,
      },
      {
        iconName: 'Car',
        title: {
          uz: 'Bepul parking',
          ru: 'Бесплатная парковка',
          en: 'Free Parking',
        },
        description: {
          uz: 'Mehmonlarimiz uchun keng va xavfsiz avtoturargoh mavjud.',
          ru: 'Просторная и безопасная парковка для наших гостей.',
          en: 'Spacious and secure parking lot for our guests.',
        },
        order: 3,
      },
      {
        iconName: 'Snowflake',
        title: {
          uz: 'Konditsioner',
          ru: 'Кондиционер',
          en: 'Air Conditioning',
        },
        description: {
          uz: "Barcha xonalarda individual boshqariladigan konditsioner o'rnatilgan.",
          ru: 'Во всех номерах установлены кондиционеры с индивидуальным управлением.',
          en: 'All rooms are equipped with individually controlled air conditioning.',
        },
        order: 4,
      },
      {
        iconName: 'ShieldCheck',
        title: {
          uz: '24/7 Xavfsizlik',
          ru: 'Безопасность 24/7',
          en: '24/7 Security',
        },
        description: {
          uz: 'Kechayu kunduz videokuzatuv va xavfsizlik xizmati ishlaydi.',
          ru: 'Круглосуточное видеонаблюдение и служба безопасности.',
          en: 'Round-the-clock video surveillance and security service.',
        },
        order: 5,
      },
      {
        iconName: 'Shirt',
        title: {
          uz: 'Kir yuvish',
          ru: 'Прачечная',
          en: 'Laundry',
        },
        description: {
          uz: 'Professional kir yuvish va dazmollash xizmati mavjud.',
          ru: 'Профессиональная стирка и глажка.',
          en: 'Professional washing and ironing service available.',
        },
        order: 6,
      },
    ];

    for (const service of services) {
      await this.serviceRepo.save(this.serviceRepo.create(service));
    }
    this.logger.log('  ✓ Services seeded (6)');
  }

  private async seedRooms() {
    const rooms = [
      {
        name: {
          uz: 'Standart xona',
          ru: 'Стандартный номер',
          en: 'Standard Room',
        },
        description: {
          uz: 'Qulay va zamonaviy jihozlangan standart xona. Keng karavot, ish stoli, shkaf va shaxsiy hammom mavjud. Xona har kuni tozalanadi.',
          ru: 'Комфортный и современно оборудованный стандартный номер. Просторная кровать, рабочий стол, шкаф и собственная ванная комната. Ежедневная уборка.',
          en: 'Comfortable and modern standard room. Spacious bed, work desk, wardrobe and private bathroom. Daily cleaning included.',
        },
        priceTiers: [{ guests: '1', price: 350000 }],
        currency: 'UZS',
        amenities: {
          uz: 'Wi-Fi, Konditsioner, TV, Mini-bar, Hammom',
          ru: 'Wi-Fi, Кондиционер, ТВ, Мини-бар, Ванная',
          en: 'Wi-Fi, AC, TV, Mini-bar, Bathroom',
        },
        order: 1,
      },
      {
        name: {
          uz: 'Lyuks xona',
          ru: 'Номер Люкс',
          en: 'Deluxe Room',
        },
        description: {
          uz: 'Keng va hashamatli lyuks xona. Alohida yotoqxona va mehmonlar xonasi, king-size karavot, jakuzi va balkon bilan jihozlangan.',
          ru: 'Просторный и роскошный номер люкс. Отдельная спальня и гостиная, кровать king-size, джакузи и балкон.',
          en: 'Spacious and luxurious deluxe room. Separate bedroom and living room, king-size bed, jacuzzi and balcony.',
        },
        priceTiers: [{ guests: '1', price: 650000 }],
        currency: 'UZS',
        amenities: {
          uz: 'Wi-Fi, Konditsioner, Smart TV, Mini-bar, Jakuzi, Balkon, Xalat',
          ru: 'Wi-Fi, Кондиционер, Smart TV, Мини-бар, Джакузи, Балкон, Халат',
          en: 'Wi-Fi, AC, Smart TV, Mini-bar, Jacuzzi, Balcony, Bathrobe',
        },
        order: 2,
      },
      {
        name: {
          uz: 'Oilaviy xona',
          ru: 'Семейный номер',
          en: 'Family Room',
        },
        description: {
          uz: "Oilalar uchun maxsus mo'ljallangan keng xona. Ikkita karavot, bolalar uchun joy va keng hammom. Oilaviy dam olish uchun ideal tanlov.",
          ru: 'Просторный номер, специально разработанный для семей. Две кровати, место для детей и просторная ванная комната.',
          en: 'Spacious room specially designed for families. Two beds, space for children and a large bathroom.',
        },
        priceTiers: [{ guests: '1', price: 500000 }],
        currency: 'UZS',
        amenities: {
          uz: 'Wi-Fi, Konditsioner, TV, Mini-bar, Keng hammom, Bolalar kravati',
          ru: 'Wi-Fi, Кондиционер, ТВ, Мини-бар, Просторная ванная, Детская кроватка',
          en: 'Wi-Fi, AC, TV, Mini-bar, Large bathroom, Baby crib',
        },
        order: 3,
      },
    ];

    for (const room of rooms) {
      await this.roomRepo.save(this.roomRepo.create(room));
    }
    this.logger.log('  ✓ Rooms seeded (3)');
  }

  private async seedNews() {
    const newsItems = [
      {
        title: {
          uz: 'Family House yangi restoranni ochdi',
          ru: 'Family House открыл новый ресторан',
          en: 'Family House Opens New Restaurant',
        },
        excerpt: {
          uz: 'Mehmonxonamizda yangi ochilgan restoran milliy va yevropa taomlarini taqdim etadi.',
          ru: 'Новый ресторан в нашей гостинице предлагает национальные и европейские блюда.',
          en: 'Our newly opened restaurant offers national and European cuisine.',
        },
        content: {
          uz: "Hurmatli mehmonlar! Biz sizlarni yangi ochilgan restoranimizga taklif qilamiz. Bizning oshpazlarimiz eng yaxshi milliy va xalqaro taomlarni tayyorlaydilar. Restoran har kuni ertalab 7:00 dan kechasi 23:00 gacha ishlaydi. Siz bu yerda nonushta, tushlik va kechki ovqatdan bahramand bo'lishingiz mumkin.",
          ru: 'Уважаемые гости! Приглашаем вас в наш новый ресторан. Наши шеф-повара готовят лучшие национальные и международные блюда. Ресторан работает ежедневно с 7:00 до 23:00.',
          en: 'Dear guests! We invite you to our newly opened restaurant. Our chefs prepare the best national and international dishes. The restaurant is open daily from 7:00 AM to 11:00 PM.',
        },
        isPublished: true,
      },
      {
        title: {
          uz: 'Yozgi chegirmalar boshlandi!',
          ru: 'Начались летние скидки!',
          en: 'Summer Discounts Have Started!',
        },
        excerpt: {
          uz: 'Yozgi mavsumda barcha xonalarga 20% gacha chegirma. Hoziroq band qiling!',
          ru: 'Скидки до 20% на все номера в летний сезон. Бронируйте сейчас!',
          en: 'Up to 20% discount on all rooms during summer season. Book now!',
        },
        content: {
          uz: "Yoz mavsumi boshlanishi munosabati bilan biz barcha mehmonlarimiz uchun maxsus chegirmalar e'lon qilamiz! 1-iyundan 31-avgustgacha barcha xonalarga 20% gacha chegirma. Bu imkoniyatni boy bermang va hoziroq band qiling!",
          ru: 'В честь начала летнего сезона мы объявляем специальные скидки для всех наших гостей! С 1 июня по 31 августа скидки до 20% на все номера.',
          en: 'To celebrate the start of summer season, we announce special discounts for all our guests! From June 1 to August 31, up to 20% discount on all rooms.',
        },
        isPublished: true,
      },
      {
        title: {
          uz: 'Yangi spa markazi ochildi',
          ru: 'Открылся новый спа-центр',
          en: 'New Spa Center Opened',
        },
        excerpt: {
          uz: "Mehmonxonamizda zamonaviy spa markazi o'z eshiklarini ochdi.",
          ru: 'В нашей гостинице открылся современный спа-центр.',
          en: 'A modern spa center has opened at our hotel.',
        },
        content: {
          uz: "Biz katta quvonch bilan yangi spa markazimizning ochilishini e'lon qilamiz! Zamonaviy jihozlar, professional xodimlar va tinchlik atmosferasi sizni kutmoqda. Massaj, sauna, basseyn va ko'plab boshqa xizmatlar mavjud.",
          ru: 'С радостью объявляем об открытии нашего нового спа-центра! Современное оборудование, профессиональный персонал и атмосфера спокойствия ждут вас.',
          en: 'We are pleased to announce the opening of our new spa center! Modern equipment, professional staff and a peaceful atmosphere await you.',
        },
        isPublished: true,
      },
    ];

    for (const news of newsItems) {
      await this.newsRepo.save(this.newsRepo.create(news));
    }
    this.logger.log('  ✓ News seeded (3)');
  }

  private async seedTestimonials() {
    const testimonials = [
      {
        authorName: 'Aziz Karimov',
        text: {
          uz: "Juda ajoyib mehmonxona! Xona toza va qulay, xodimlar juda mehribon. Oilam bilan dam oldik va juda mamnun bo'ldik. Albatta yana qaytib kelamiz!",
          ru: 'Замечательная гостиница! Номер чистый и удобный, персонал очень дружелюбный. Отдыхали с семьёй и остались очень довольны. Обязательно вернёмся!',
          en: 'Wonderful hotel! The room was clean and comfortable, the staff very friendly. We had a great family vacation and were very satisfied. We will definitely come back!',
        },
        rating: 5,
        order: 1,
      },
      {
        authorName: 'Мария Петрова',
        text: {
          uz: "Lokatsiya zo'r — shahar markazida. Nonushta juda mazali va xilma-xil. Xona keng va barcha kerakli narsalar bor. Tavsiya qilaman!",
          ru: 'Отличное расположение — в центре города. Завтрак очень вкусный и разнообразный. Номер просторный и есть всё необходимое. Рекомендую!',
          en: 'Great location — in the city center. Breakfast was delicious and varied. The room was spacious with everything needed. Highly recommend!',
        },
        rating: 5,
        order: 2,
      },
      {
        authorName: 'John Smith',
        text: {
          uz: 'Business trip uchun juda qulay. Tezkor Wi-Fi, qulay ish stoli va tinch muhit. Xodimlar ingliz tilida gaplashadi va juda yordamchi.',
          ru: 'Очень удобно для деловых поездок. Быстрый Wi-Fi, удобный рабочий стол и тихая обстановка. Персонал говорит по-английски и очень помогает.',
          en: 'Very convenient for business trips. Fast Wi-Fi, comfortable work desk and quiet environment. Staff speaks English and is very helpful.',
        },
        rating: 4,
        order: 3,
      },
      {
        authorName: 'Nilufar Rahimova',
        text: {
          uz: "To'y tantanamizni shu yerda o'tkazdik. Hammasi ajoyib tashkil qilindi — bezak, ovqat, xizmat. Mehmonlarimiz ham juda mamnun bo'lishdi.",
          ru: 'Мы провели здесь нашу свадебную церемонию. Всё было организовано прекрасно — декор, еда, сервис. Наши гости тоже остались очень довольны.',
          en: 'We held our wedding ceremony here. Everything was organized perfectly — decor, food, service. Our guests were also very pleased.',
        },
        rating: 5,
        order: 4,
      },
    ];

    for (const testimonial of testimonials) {
      await this.testimonialRepo.save(this.testimonialRepo.create(testimonial));
    }
    this.logger.log('  ✓ Testimonials seeded (4)');
  }

  private async seedVideos() {
    const videos = [
      {
        caption: 'Mehmonxona lobbysi',
        instagramUrl: 'https://www.instagram.com/familyhouse',
        order: 1,
      },
      {
        caption: 'Lyuks xona',
        instagramUrl: 'https://www.instagram.com/familyhouse',
        order: 2,
      },
      {
        caption: 'Restoran',
        instagramUrl: 'https://www.instagram.com/familyhouse',
        order: 3,
      },
      {
        caption: "Tashqi ko'rinish",
        instagramUrl: 'https://www.instagram.com/familyhouse',
        order: 4,
      },
    ];

    for (const video of videos) {
      await this.videoRepo.save(this.videoRepo.create(video));
    }
    this.logger.log('  ✓ Videos seeded (4)');
  }
}
