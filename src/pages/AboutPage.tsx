import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Target, 
  Award, 
  Users, 
  Building, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';

interface AboutPageProps {
  onOpenQuote: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenQuote }) => {
  const values = [
    {
      title: 'Obsessive Reliability',
      desc: 'We respect your time. Whether it’s an urgent burst pipe at 2 AM or scheduled office maintenance, our teams arrive promptly on schedule.',
      icon: ShieldCheck,
    },
    {
      title: 'Transparent Pricing',
      desc: 'No hidden charges or surprise line items. Detailed digital estimates provided upfront with clear material and labor breakdowns.',
      icon: Target,
    },
    {
      title: 'Skilled Craftsmanship',
      desc: 'Every technician is rigorously vetted, background-verified, and regularly upskilled on modern tooling and health & safety standards.',
      icon: Award,
    },
    {
      title: 'Technology-Enabled',
      desc: 'Real-time job tracking, digital inspection audits, and SLA reporting powered by automated facility workflows.',
      icon: TrendingUp,
    }
  ];


  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Header */}
      <section className="bg-brand-navy text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-4 border border-brand-green/30">
            About Taaskmate
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Your Task. Our Expertise.
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Building India's most dependable, tech-enabled property operations and facility services company.
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
              Our Vision & Mission
            </span>
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">
              Transforming Fragmented Repairs into Unified Professional Excellence
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Property maintenance historically meant dealing with unreliable local vendors, unpredictable pricing, and substandard workmanship. Taaskmate was established to bridge this gap with institutional-grade standards.
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              Today, we serve leading IT parks, hospitals, apartment communities, and corporate enterprises across Bengaluru, Hyderabad, Mumbai, and Delhi NCR with verified technicians and ironclad service guarantees.
            </p>

            <div className="pt-2 flex items-center gap-6">
              <div>
                <div className="text-3xl font-extrabold text-brand-navy">50,000+</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">Tasks Completed</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-3xl font-extrabold text-brand-navy">15M+</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">Sq. Ft. Managed</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-3xl font-extrabold text-brand-green">99.4%</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">SLA Adherence</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <img
              src="https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1000&q=80"
              alt="Taaskmate engineers collaborating on site"
              className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
              Our Core Principles
            </span>
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
              What Defines Every Taaskmate Service
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-[#F7F8F9] border border-gray-200/80">
                  <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">{v.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="bg-brand-navy py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Taaskmate Standard?</h2>
          <p className="text-gray-300 text-base mb-8">Let’s discuss your property management requirements or schedule an on-site safety audit.</p>
          <button
            onClick={onOpenQuote}
            className="px-8 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Get a Free Quote
          </button>
        </div>
      </section>
    </div>
  );
};
