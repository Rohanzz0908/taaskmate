import React from 'react';
import { Hero } from '../components/home/Hero';
import { ServicesGrid } from '../components/home/ServicesGrid';
import { AboutSection } from '../components/home/AboutSection';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { ProcessFlow } from '../components/home/ProcessFlow';
import { PropertyManagementPreview } from '../components/home/PropertyManagementPreview';
import { InteriorDesignPreview } from '../components/home/InteriorDesignPreview';
import { Testimonials } from '../components/home/Testimonials';
import { CTASection } from '../components/home/CTASection';
import { ContactSection } from '../components/home/ContactSection';

interface HomePageProps {
  onOpenQuote: (serviceName?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenQuote }) => {
  return (
    <div className="space-y-0">
      <Hero onOpenQuote={() => onOpenQuote()} />
      <ServicesGrid onOpenQuote={onOpenQuote} />
      <AboutSection />
      <WhyChooseUs />
      <ProcessFlow />
      <PropertyManagementPreview />
      <InteriorDesignPreview />
      <Testimonials />
      <CTASection onOpenQuote={() => onOpenQuote()} />
      <ContactSection />
    </div>
  );
};
