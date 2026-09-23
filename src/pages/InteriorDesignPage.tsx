import React from 'react';
import { 
  Sparkles, 
  Palette, 
  Home, 
  Building2, 
  Maximize2, 
  Sofa, 
  Lamp, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface InteriorDesignPageProps {
  onOpenQuote: (serviceName?: string) => void;
}

export const InteriorDesignPage: React.FC<InteriorDesignPageProps> = ({ onOpenQuote }) => {
  const services = [
    { name: 'Residential Interiors', desc: 'Bespoke apartment and villa living spaces, master suites, and cozy balconies.' },
    { name: 'Office Interiors', desc: 'Modern collaborative workspaces, executive cabins, and ergonomic cafeteria areas.' },
    { name: 'Commercial Interiors', desc: 'Retail showrooms, boutique clinics, and experiential hospitality fit-outs.' },
    { name: 'Space Planning', desc: 'Architectural 3D floor layout optimization ensuring zero dead space.' },
    { name: 'Renovation', desc: 'Full structural modernizations, wall removal, bathroom remodels & fresh flooring.' },
    { name: 'Furniture', desc: 'Custom tailored solid-wood couches, modular wardrobes, and designer consoles.' },
    { name: 'Lighting', desc: 'Architectural layered illumination: ambient cove, task lighting & smart dimmers.' },
    { name: 'Turnkey Solutions', desc: 'Single-contract delivery from 3D conceptualization to handover with warranty.' }
  ];

  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Banner */}
      <section className="bg-brand-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80"
            alt="Interior design banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Transform Your Space
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From concept to completion, Taaskmate helps create functional, beautiful and modern spaces tailored to your lifestyle and brand identity.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => onOpenQuote('Interior Design Consultation')}
              className="px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Book Design Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
            Design Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight mt-1 mb-3">
            Tailored Interior Disciplines
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Everything executed by our in-house architects, civil engineers, and master carpenters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-brand-green hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">{item.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Realtime Showcase Callout */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200/80 shadow-md text-center max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-4">
            <Palette className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-brand-navy mb-3">
            Project Showcase Gallery Updating Shortly
          </h3>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            We are curating our latest high-definition photographs and walkthrough videos of completed residential and commercial fit-outs. In the meantime, schedule a 1-on-1 consultation with our interior architects.
          </p>
          <button
            onClick={() => onOpenQuote('Interior Design Consultation')}
            className="px-6 py-3 bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-bold rounded-xl shadow transition-all cursor-pointer"
          >
            Schedule Consultation
          </button>
        </div>
      </section>
    </div>
  );
};
