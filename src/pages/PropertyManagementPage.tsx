import React from 'react';
import { 
  Building, 
  ShieldCheck, 
  Wrench, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Users,
  HardHat,
  Sliders
} from 'lucide-react';

interface PropertyManagementPageProps {
  onOpenQuote: (serviceName?: string) => void;
}

export const PropertyManagementPage: React.FC<PropertyManagementPageProps> = ({ onOpenQuote }) => {
  const amcTiers = [
    {
      name: 'Essential Care',
      tag: 'Small Societies & Retail',
      price: 'Custom SLA',
      features: [
        'Quarterly HVAC & electrical audits',
        'Routine plumbing inspection',
        '24-hour emergency response SLA',
        'Pest control biannual treatments',
        'Digital maintenance logbook',
      ],
      popular: false,
    },
    {
      name: 'Commercial Pro',
      tag: 'Tech Parks & Office Buildings',
      price: 'Popular Enterprise',
      features: [
        'Monthly comprehensive preventive checks',
        'Dedicated on-site facility technician',
        '2-hour emergency response SLA',
        'Complete janitorial & waste management',
        'Statutory fire & elevator compliance',
        'Dedicated operations manager',
      ],
      popular: true,
    },
    {
      name: 'Turnkey Master',
      tag: 'Gated Communities & Mega Campuses',
      price: 'All-Inclusive SLA',
      features: [
        '24/7 dedicated engineering & housekeeping squad',
        '30-min priority emergency dispatch',
        'Swimming pool & landscaping upkeep',
        'Visitor & security biometric management',
        'Zero-downtime equipment replacement cover',
        'Executive board monthly audit reporting',
      ],
      popular: false,
    },
  ];

  const corePillars = [
    {
      icon: Wrench,
      title: 'Preventive & Corrective Maintenance',
      desc: 'Scheduled servicing of diesel generators (DG), transformers, chillers, water treatment plants (WTP/STP), and booster pumps.'
    },
    {
      icon: Sparkles,
      title: 'Integrated Housekeeping & Janitorial',
      desc: 'Mechanized scrubbing, glass facade washing, green chemical sanitization, and eco-certified waste disposal systems.'
    },
    {
      icon: ShieldCheck,
      title: 'Physical & Digital Security Systems',
      desc: 'Licensed security guards, gate automation, boom barriers, fire hydrants, and 24/7 centralized surveillance rooms.'
    },
    {
      icon: TrendingUp,
      title: 'Long-term Asset Lifecycle Maximization',
      desc: 'Predictive analytics to track equipment degradation, preventing sudden failures and slashing operational capital expenditure.'
    }
  ];

  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Hero Banner */}
      <section className="bg-brand-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"
            alt="Corporate high-rise building"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-4 border border-brand-green/30">
              Enterprise Facility Management
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Complete Property Management Solutions
            </h1>
            <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed">
              We manage over 15 million square feet across Bengaluru, Mumbai, and Delhi NCR. From preventive maintenance and AMC contracts to manned security and groundskeeping.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onOpenQuote('Property Management AMC')}
                className="px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Schedule Site Audit
              </button>
              <a
                href="#amc-plans"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-all text-center"
              >
                View AMC Packages
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
            Engineering & Operations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mt-2 mb-4">
            Unified Facilities, Zero Friction
          </h2>
          <p className="text-gray-600 text-base">
            Single-window accountability for commercial buildings, residential gated societies, and retail complexes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {corePillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AMC Packages */}
      <section id="amc-plans" className="py-20 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
              Annual Maintenance Contracts
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mt-2 mb-4">
              Flexible AMC Tiers Designed for Every Scale
            </h2>
            <p className="text-gray-600 text-base">
              Predictable costs, guaranteed uptime, and rigorous compliance checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {amcTiers.map((tier, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? 'bg-brand-navy text-white shadow-2xl ring-2 ring-brand-green relative scale-105 md:-translate-y-2'
                    : 'bg-[#F7F8F9] text-gray-800 border border-gray-200/80'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-green text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className={`text-2xl font-bold mb-1 ${tier.popular ? 'text-white' : 'text-brand-navy'}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-xs mb-6 ${tier.popular ? 'text-gray-300' : 'text-gray-500'}`}>
                    {tier.tag}
                  </p>

                  <div className="space-y-3.5 mb-8">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? 'text-brand-green' : 'text-brand-green'}`} />
                        <span className={tier.popular ? 'text-gray-200' : 'text-gray-700'}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenQuote(`${tier.name} AMC Plan`)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    tier.popular
                      ? 'bg-brand-green hover:bg-brand-green-hover text-white shadow-md'
                      : 'bg-brand-navy hover:bg-brand-navy-light text-white'
                  }`}
                >
                  Request Proposal
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
