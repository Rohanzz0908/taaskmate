import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const checklist = [
    'Maintenance & Repairs',
    'Janitorial Services',
    'Security Services',
    'Pest Control',
    'Landscaping & Groundskeeping',
    'Facility Management',
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-green">
              <span>About Taaskmate</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
              Transforming Facility & Property Management in India
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Taaskmate is a modern on-demand facility management and property services platform delivering reliable end-to-end solutions for residential, commercial, corporate, retail, healthcare, IT and other properties.
            </p>

            <p className="text-base text-gray-600 leading-relaxed">
              Our mission is to make property maintenance simple, reliable, transparent and hassle-free.
            </p>

            {/* 6 Checkmarks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 pb-4">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4 text-brand-green" />
              </Link>

              <Link
                to="/property-management"
                className="inline-flex items-center gap-2 px-5 py-3 text-brand-navy hover:text-brand-green text-sm font-bold rounded-xl border border-gray-200 hover:border-brand-green transition-colors"
              >
                <span>Explore Property AMC</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Composite */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80"
                alt="Skilled electrical & facility technician at modern commercial building"
                className="w-full h-[420px] sm:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 -left-4 sm:bottom-8 sm:-left-8 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 max-w-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-green text-white flex items-center justify-center shrink-0 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-brand-navy">10+ Years</div>
                <div className="text-xs text-gray-500 font-medium">Delivering Benchmark Facility Standards</div>
              </div>
            </div>

            {/* Floating Technicians Metric */}
            <div className="hidden sm:flex absolute -top-4 -right-4 bg-brand-navy text-white p-4 rounded-xl shadow-lg border border-brand-navy-light items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse"></div>
              <div className="text-xs font-semibold">2,500+ Certified Technicians On-Duty</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
