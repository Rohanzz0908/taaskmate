import React from 'react';
import { servicesList } from '../../data/servicesData';
import { ServiceCard } from './ServiceCard';

interface ServicesGridProps {
  onOpenQuote: (serviceName?: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onOpenQuote }) => {
  return (
    <section id="services" className="py-20 bg-[#F7F8F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-3">
            Comprehensive Solutions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Everything you need to keep your property safe, functional, clean, and well maintained.
          </p>
        </div>

        {/* Services Card Grid: 5 columns on 2xl, 4 on xl/lg, 2-3 on md, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5">
          {servicesList.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onOpenQuote={onOpenQuote}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
