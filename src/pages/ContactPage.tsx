import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { servicesList } from '../data/servicesData';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Plumbing',
    propertyType: 'Residential',
    city: 'Bengaluru',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const offices = [
    {
      city: 'Bengaluru (HQ)',
      address: 'Taaskmate Facility Towers, #42, Outer Ring Road, Bellandur, Bengaluru 560103',
      phone: '+91 80 4567 8900',
      email: 'blr@taaskmate.com'
    },
    {
      city: 'Mumbai',
      address: 'Level 5, One BKC, G Block, Bandra Kurla Complex, Mumbai 400051',
      phone: '+91 22 6789 1234',
      email: 'mum@taaskmate.com'
    },
    {
      city: 'Hyderabad',
      address: 'Unit 302, Cyber Towers, Hitec City, Madhapur, Hyderabad 500081',
      phone: '+91 40 4321 9876',
      email: 'hyd@taaskmate.com'
    },
    {
      city: 'Delhi NCR',
      address: 'Tower B, DLF Cyber City, Phase 2, Gurugram, Haryana 122002',
      phone: '+91 124 5566 778',
      email: 'delhi@taaskmate.com'
    }
  ];

  const faqs = [
    {
      q: 'How quickly can a technician reach my property?',
      a: 'For emergency electrical, plumbing, or AC breakdowns, our nearest verified squad reaches within 45 to 60 minutes. For scheduled AMC checks or routine maintenance, you can pick any convenient 2-hour window.'
    },
    {
      q: 'Are Taaskmate technicians verified and background checked?',
      a: 'Yes, 100% of our on-ground workforce undergoes police verification, address validation, and strict technical trade skill certifications before being dispatched on jobs.'
    },
    {
      q: 'Does Taaskmate offer service warranties?',
      a: 'Yes, all repair and maintenance tasks come with a standard 30-day post-service warranty. If any issue reoccurs within the warranty period, we provide complimentary re-work.'
    },
    {
      q: 'Can we customize AMC contracts for commercial office spaces?',
      a: 'Absolutely. We tailor bespoke Annual Maintenance Contracts covering HVAC chillers, diesel generators, UPS power distribution, mechanized housekeeping, and security guarding with dedicated SLAs.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Hero Banner */}
      <section className="bg-brand-navy text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-4 border border-brand-green/30">
            24/7 Responsive Dispatch
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Contact Taaskmate
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Reach our central operations desk or speak with our facility managers across 4 major metropolitan hubs.
          </p>
        </div>
      </section>

      {/* Main Grid: Form & Regional Offices */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold text-brand-navy mb-2">Send Us an Inquiry</h2>
              <p className="text-xs text-gray-500 mb-6">Receive detailed pricing proposals and technical site feasibility within 2 hours.</p>

              {submitted ? (
                <div className="text-center py-12 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-navy">Inquiry Dispatched!</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Thank you, <strong>{formData.name}</strong>. Ticket #TM-{Math.floor(100000 + Math.random() * 900000)} has been created. Our regional desk will call you at <strong>{formData.phone}</strong>.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-lg text-sm mt-4 cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Rajesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="rajesh@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">City *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green bg-white"
                      >
                        <option>Bengaluru</option>
                        <option>Mumbai</option>
                        <option>Hyderabad</option>
                        <option>Delhi NCR</option>
                        <option>Pune</option>
                        <option>Chennai</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Service Required *</label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green bg-white font-medium text-brand-navy"
                      >
                        {servicesList.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Property Type *</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green bg-white"
                      >
                        <option>Corporate Office</option>
                        <option>Residential Society</option>
                        <option>Individual Villa / Flat</option>
                        <option>Retail Store / Mall</option>
                        <option>Healthcare Center</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Specific Task Scope</label>
                    <textarea
                      rows={3}
                      placeholder="Brief details about the task, timeline, square footage..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Office Hubs */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
                Our Presence
              </span>
              <h2 className="text-2xl font-bold text-brand-navy mt-1 mb-4">
                Regional Hubs
              </h2>
            </div>

            <div className="space-y-4">
              {offices.map((office, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-brand-navy font-bold text-base">
                    <Building2 className="w-4 h-4 text-brand-green" />
                    <span>{office.city}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pl-6">{office.address}</p>
                  <div className="flex items-center gap-4 text-xs font-semibold pl-6 pt-1">
                    <a href={`tel:${office.phone}`} className="text-brand-green hover:underline">{office.phone}</a>
                    <span className="text-gray-300">|</span>
                    <a href={`mailto:${office.email}`} className="text-gray-600 hover:text-brand-navy">{office.email}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 bg-white border-t border-gray-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-brand-navy pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-brand-green' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-1 bg-gray-50 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
