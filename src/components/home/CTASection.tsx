import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Sparkles } from 'lucide-react';

interface CTASectionProps {
  onOpenQuote: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenQuote }) => {
  return (
    <section className="py-16 sm:py-20 bg-brand-green text-white relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none blur-xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/10 pointer-events-none blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> 24/7 Dedicated Support
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Need a Service? <br className="hidden sm:inline" />
              We’ve Got It Covered.
            </h2>
            <p className="text-base sm:text-lg text-emerald-50 mt-4 leading-relaxed font-medium">
              From a quick repair to complete property maintenance, Taaskmate is ready to help.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenQuote}
              className="w-full sm:w-auto px-8 py-4 bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Request a Service</span>
              <ArrowRight className="w-5 h-5 text-brand-green" />
            </button>

            <Link
              to="/contact"
              className="w-full sm:w-auto px-7 py-4 bg-white/15 hover:bg-white/25 text-white font-bold text-base rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
