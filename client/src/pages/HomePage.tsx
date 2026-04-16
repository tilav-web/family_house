import { Footer } from '../components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { RoomsSection } from '@/components/sections/RoomsSection'
import { NewsSection } from '@/components/sections/NewsSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { VideosSection } from '@/components/sections/VideosSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { LocationSection } from '@/components/sections/LocationSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <main id="main-content" className="relative z-20 bg-background">
        <AboutSection />
        <ServicesSection />
        <RoomsSection />
        <NewsSection />
        <TestimonialsSection />
        <VideosSection />
        <ContactSection />
        <LocationSection />
        <Footer />
      </main>
    </>
  )
}
