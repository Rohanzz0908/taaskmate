import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, CheckCircle2, Clock, ArrowRight, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { servicesList, ServiceItem } from '../data/servicesData';
import { ServiceIcon } from '../components/ServiceIcon';

interface ServicesPageProps {
  onOpenQuote: (serviceName?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenQuote }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'facility' | 'specialized'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Handle anchor scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const filteredServices = servicesList.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000&q=80"
            alt="Services banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-4 border border-brand-green/30">
            End-to-End Solutions
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Our Complete Service Catalog
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Explore 12 specialized property and facility management services delivered by verified, certified professionals.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Services ({servicesList.length})
            </button>
            <button
              onClick={() => setSelectedCategory('core')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'core'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Core Maintenance
            </button>
            <button
              onClick={() => setSelectedCategory('facility')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'facility'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Facility Operations
            </button>
            <button
              onClick={() => setSelectedCategory('specialized')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'specialized'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Specialized Projects
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search any service or task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-green focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Services Listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-base">No services match your search term "{searchQuery}".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-sm font-bold text-brand-green hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                id={service.slug}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shadow-sm">
                      <ServiceIcon name={service.icon} size={24} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3 text-brand-green" /> {service.turnaroundTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-navy mb-2">
                    {service.name}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {service.fullDesc}
                  </p>

                  {/* Highlights List */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 mb-6">
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Key Capabilities:
                    </div>
                    {service.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => onOpenQuote(service.name)}
                    className="flex-1 py-2.5 px-4 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-lg shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenQuote(`Custom AMC - ${service.name}`)}
                    className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-brand-navy text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    AMC Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-green/15 text-brand-green flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy">100% Service Quality Guarantee</h3>
              <p className="text-sm text-gray-600">30-day post-service warranty with complimentary re-work guarantee.</p>
            </div>
          </div>
          <button
            onClick={() => onOpenQuote()}
            className="px-6 py-3 bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-bold rounded-xl shadow transition-all shrink-0 cursor-pointer"
          >
            Request On-Site Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
