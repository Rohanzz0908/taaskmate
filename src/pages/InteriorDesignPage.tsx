import React, { useState } from 'react';
import { 
  Sparkles, 
  Palette, 
  Home, 
  Building2, 
  Maximize2, 
  Sofa, 
  Lamp, 
  CheckCircle2, 
  ArrowRight,
  Eye
} from 'lucide-react';

interface InteriorDesignPageProps {
  onOpenQuote: (serviceName?: string) => void;
}

export const InteriorDesignPage: React.FC<InteriorDesignPageProps> = ({ onOpenQuote }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'residential' | 'office' | 'commercial'>('all');

  const portfolioItems = [
    {
      title: 'Modern Minimalist Villa',
      category: 'residential',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      desc: 'Clean architectural lines, imported Italian marble, and bespoke veneer cabinetry.',
      location: 'Whitefield, Bengaluru'
    },
    {
      title: 'Agile Tech Workspace',
      category: 'office',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      desc: '120-workstation open floor plan with acoustic phone pods and ergonomic sit-stand desks.',
      location: 'BKC, Mumbai'
    },
    {
      title: 'Luxury Modular Kitchen & Dining',
      category: 'residential',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      desc: 'Quartz countertops, soft-close Blum hardware, integrated dishwasher & wine cooler.',
      location: 'Jubilee Hills, Hyderabad'
    },
    {
      title: 'Premium Retail Flagship Store',
      category: 'commercial',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      desc: 'Track spotlights, minimalist brass display fixtures, and custom terrazzo floor finishes.',
      location: 'Indiranagar, Bengaluru'
    },
    {
      title: 'Biophilic Executive Boardroom',
      category: 'office',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
      desc: 'Live vertical moss wall, automated Lutron blinds, and surround sound video bar.',
      location: 'Cyber City, Gurugram'
    },
    {
      title: 'Contemporary Master Suite',
      category: 'residential',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
      desc: 'Walk-in wardrobe with tinted fluted glass, ambient cove lighting & plush headboard.',
      location: 'Koramangala, Bengaluru'
    }
  ];

  const filteredPortfolio = portfolioItems.filter(
    item => activeTab === 'all' || item.category === activeTab
  );

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-4 border border-brand-green/30">
            Concept to Completion
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Transform Your Space
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From concept to completion, Taaskmate helps create functional, beautiful and modern spaces tailored to your lifestyle and brand identity.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => onOpenQuote('Interior Design Consultation')}
              className="px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Book Design Consultation
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

      {/* Portfolio Gallery */}
      <section className="py-16 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
                Recent Projects
              </span>
              <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
                Featured Space Transformations
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {(['all', 'residential', 'office', 'commercial'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPortfolio.map((item, idx) => (
              <div
                key={idx}
                className="group rounded-2xl overflow-hidden bg-[#F7F8F9] border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-bold text-brand-navy px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-xs text-brand-green font-semibold mb-1">{item.location}</div>
                    <h3 className="text-lg font-bold text-brand-navy mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => onOpenQuote(`Interior Project: ${item.title}`)}
                    className="w-full py-2 bg-white hover:bg-brand-green hover:text-white text-brand-navy text-xs font-bold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Request Similar Design Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
