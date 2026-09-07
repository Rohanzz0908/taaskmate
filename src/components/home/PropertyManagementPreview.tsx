import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Building2, ShieldCheck, Wrench, Sparkles } from 'lucide-react';

export const PropertyManagementPreview: React.FC = () => {
  const offerings = [
    { title: 'Preventive Maintenance', desc: 'Scheduled HVAC, electrical & plumbing checks to avoid costly downtime.' },
    { title: 'Facility Management', desc: 'Comprehensive operation management for commercial & residential buildings.' },
    { title: 'Housekeeping', desc: 'Daily mechanized cleaning, waste management, and common area upkeep.' },
    { title: 'Security Services', desc: 'Trained manned guarding, visitor management systems & CCTV monitoring.' },
    { title: 'Landscaping', desc: 'Horticulture, lawn maintenance, drip irrigation & aesthetic groundskeeping.' },
    { title: 'AMC Contracts', desc: 'Custom annual agreements with guaranteed response SLAs and discounted parts.' },
    { title: 'Emergency Repairs', desc: '24/7 dedicated dispatch team for critical pipe bursts, outages & hazards.' },
    { title: 'Building Maintenance', desc: 'Civil repairs, facade waterproofing, elevator audits, and fire drill compliance.' },
  ];

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider">
              Asset Protection & Value
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
              Complete Property Management Solutions
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Ensure long-term asset value, zero operational downtime, and seamless tenant satisfaction with our unified property management services.
            </p>

            {/* Offerings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {offerings.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                to="/property-management"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 group"
              >
                <span>Learn More About Property Solutions</span>
                <ArrowRight className="w-4 h-4 text-brand-green group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Imagery Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
                alt="Modern corporate commercial tower managed by Taaskmate"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-2 text-brand-green text-xs font-bold tracking-wider uppercase mb-1">
                  <Building2 className="w-4 h-4" /> 15 Million+ Sq. Ft. Managed
                </div>
                <div className="text-lg font-bold">Trusted by 250+ Gated Communities & Tech Parks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
