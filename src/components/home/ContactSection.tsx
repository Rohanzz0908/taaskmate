import React, { useState } from 'react';
import { Send, CheckCircle2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { servicesList } from '../../data/servicesData';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    propertyType: 'Corporate / Commercial',
    serviceRequired: 'Plumbing',
    location: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section id="contact-form" className="py-20 bg-[#F7F8F9] border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Contact Info & Support */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-green">
              <span>Connect With Taaskmate</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Let’s Get Started
            </h2>

            <p className="text-base text-gray-600 leading-relaxed">
              Have an immediate repair, planning a turnkey interior revamp, or need enterprise facility management for your commercial complex? Fill out the form, and our regional operations manager will get in touch.
            </p>

            {/* Micro Details Cards */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">Call Directly</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Toll-free / WhatsApp available 24/7</p>
                  <a href="tel:+918045678900" className="text-sm font-bold text-brand-green hover:underline mt-1 inline-block">
                    +91 80 4567 8900
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">Corporate Desk</h4>
                  <p className="text-xs text-gray-500 mt-0.5">For AMC tenders and commercial vendor queries</p>
                  <a href="mailto:support@taaskmate.com" className="text-sm font-bold text-brand-green hover:underline mt-1 inline-block">
                    support@taaskmate.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">Rapid Turnaround</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Average initial inspection scheduled within 60 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xl border border-gray-100">
              {submitted ? (
                <div className="text-center py-12 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-navy">Request Dispatched Successfully!</h3>
                  <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                    Thank you, <strong className="text-brand-navy">{formData.fullName}</strong>. A dedicated Taaskmate supervisor has received your service inquiry and will contact you at <strong className="text-brand-navy">{formData.phone}</strong> shortly.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          fullName: '',
                          phone: '',
                          email: '',
                          propertyType: 'Corporate / Commercial',
                          serviceRequired: 'Plumbing',
                          location: '',
                          message: '',
                        });
                      }}
                      className="px-6 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                    >
                      Send Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-brand-navy mb-4">
                    Schedule an On-Demand Consultation
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aditi Roy"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="aditi@company.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Property Type *
                      </label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      >
                        <option>Corporate / Commercial Office</option>
                        <option>Residential Apartment / Villa</option>
                        <option>Gated Residential Society (RWA)</option>
                        <option>Retail Store / Showroom</option>
                        <option>Hospital / Medical Center</option>
                        <option>Industrial Warehouse</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Service Required */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Service Required *
                      </label>
                      <select
                        value={formData.serviceRequired}
                        onChange={(e) => setFormData({ ...formData, serviceRequired: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white font-medium text-brand-navy"
                      >
                        {servicesList.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Location / Area *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Whitefield, Bengaluru"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Task Description & Timelines
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the issue, square footage, urgency, or preferred inspection time..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-brand-green" />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
