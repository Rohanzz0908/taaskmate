import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, Layers } from 'lucide-react';

export const InteriorDesignPreview: React.FC = () => {
  const services = [
    'Residential Interiors',
    'Office Interiors',
    'Commercial Interiors',
    'Space Planning',
    'Renovation',
    'Furniture',
    'Lighting',
    'Turnkey Solutions',
  ];

  return (
    <section className="py-20 bg-[#F7F8F9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Premium Interior Image */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Modern luxury interior design executed by Taaskmate"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/50 text-brand-navy shadow-lg">
                <span className="text-xs font-bold text-brand-green uppercase tracking-wider block">Award-Winning Craft</span>
                <span className="text-sm font-extrabold">350+ Homes & Offices Designed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Services Pills */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-green">
              <span>Bespoke Design & Build</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
              Transform Your Space
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              From concept to completion, Taaskmate helps create functional, beautiful and modern spaces.
            </p>

            {/* Design Offerings Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
              {services.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:border-brand-green transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-sm font-bold text-gray-800">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/interior-design"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 group"
              >
                <span>Explore Interior Portfolios</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
