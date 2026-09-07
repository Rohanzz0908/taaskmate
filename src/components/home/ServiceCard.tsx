import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ServiceItem } from '../../data/servicesData';
import { ServiceIcon } from '../ServiceIcon';

interface ServiceCardProps {
  service: ServiceItem;
  onOpenQuote: (serviceName: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onOpenQuote }) => {
  return (
    <div className="group relative bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between">
      {/* Top Icon and category */}
      <div>
        <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white flex items-center justify-center transition-all duration-300 mb-4 shadow-sm">
          <ServiceIcon name={service.icon} size={22} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-green transition-colors mb-2">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
          {service.shortDesc}
        </p>
      </div>

      {/* Action Links */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
        <Link
          to={`/services#${service.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:text-brand-green-hover transition-colors group/link"
        >
          <span>Learn More</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
        </Link>

        <button
          onClick={() => onOpenQuote(service.name)}
          className="text-xs font-semibold text-gray-500 hover:text-brand-navy hover:underline cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
