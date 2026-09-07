import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, Users, Star } from 'lucide-react';

interface HeroProps {
  onOpenQuote: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote }) => {
  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-brand-navy overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000&q=80"
          alt="Professional facility technician at work"
          className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Rich Multi-stop Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/60"></div>
        {/* Subtle radial glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-green/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="max-w-3xl">

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Reliable Services. <br />
            <span className="text-brand-green">Smarter Spaces.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl font-normal">
            From everyday maintenance to complete facility management, Taaskmate delivers reliable, professional services for homes, businesses, and properties.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
            <button
              onClick={onOpenQuote}
              className="px-7 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-base rounded-xl shadow-lg hover:shadow-brand-green/25 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get a Quote</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              to="/services"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-base rounded-xl border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <span>Explore Services</span>
            </Link>
          </div>

          {/* Trust Highlights Grid */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-green">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">50,000+ Tasks</div>
                <div className="text-xs text-gray-400">Completed On-Time</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-green">
                <Star className="w-5 h-5 fill-brand-green text-brand-green" />
              </div>
              <div>
                <div className="text-sm font-bold">4.9 / 5 Rating</div>
                <div className="text-xs text-gray-400">Verified Client Reviews</div>
              </div>
            </div>

            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-green">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">45-Min Response</div>
                <div className="text-xs text-gray-400">Emergency Dispatch</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
