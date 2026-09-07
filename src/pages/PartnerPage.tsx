import React, { useState } from 'react';
import { 
  Users, 
  Wrench, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Send,
  Sparkles
} from 'lucide-react';

export const PartnerPage: React.FC = () => {
  const [partnerType, setPartnerType] = useState('Technician / Service Professional');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const partnerCategories = [
    {
      title: 'Skilled Technicians & Handymen',
      desc: 'Plumbers, electricians, AC technicians, carpenters and painters looking for guaranteed consistent daily job allocations.',
      icon: Wrench,
    },
    {
      title: 'Civil & Specialized Contractors',
      desc: 'Waterproofing teams, structural tiling contractors, interior fit-out agencies, and deep sanitization squads.',
      icon: Building2,
    },
    {
      title: 'Facility Service Providers',
      desc: 'Security agencies, landscape maintenance agencies, waste management providers, and janitorial operations.',
      icon: Users,
    },
    {
      title: 'Hardware & Material Vendors',
      desc: 'Suppliers of branded electrical switchgear, plumbing valves, sanitization consumables, and LED fixtures.',
      icon: ShieldCheck,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Banner */}
      <section className="bg-brand-navy text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-4 border border-brand-green/30">
            Collaborative Growth
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Partner With Taaskmate
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Expand your business and unlock steady, high-ticket recurring orders from India’s top tech parks, gated communities, and enterprises.
          </p>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
            Ecosystem Network
          </span>
          <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
            Who Can Partner With Us?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partnerCategories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-5"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-brand-navy mb-2">Steady Enterprise Volume</h4>
              <p className="text-xs sm:text-sm text-gray-600">Access thousands of pre-verified residential and corporate service contracts with zero client acquisition marketing expense.</p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-brand-navy mb-2">Guaranteed On-Time Payouts</h4>
              <p className="text-xs sm:text-sm text-gray-600">Weekly automated settlements straight into your bank account with complete transparent digital invoice visibility.</p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-brand-navy mb-2">Smart Tech App & Training</h4>
              <p className="text-xs sm:text-sm text-gray-600">Equip your workforce with Taaskmate’s technician mobile app for GPS job routing, material dispatch, and safety checklists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Registration Form */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-200">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
              Onboarding Form
            </span>
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
              Become a Verified Partner
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Fill in your organization details. Our vendor onboarding department will evaluate your profile within 48 hours.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-brand-navy">Registration Submitted!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Thank you, <strong>{contactPerson}</strong>. Your vendor application for <strong>{partnerType}</strong> has been logged. Our partnership manager will get in touch at <strong>{phone}</strong>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-lg text-sm mt-4 cursor-pointer"
              >
                Register Another Business
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Partnership Category *
                  </label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green bg-white font-medium text-brand-navy"
                  >
                    <option>Technician / Service Professional</option>
                    <option>Civil / Specialized Contractor</option>
                    <option>Facility & Security Agency</option>
                    <option>Hardware / Spares Material Vendor</option>
                    <option>Commercial Enterprise Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Precision ElectroMech Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Patel"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="suresh@precision.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Operational City / State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru / Karnataka"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Partner Application</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
