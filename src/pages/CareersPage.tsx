import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Layers, 
  Mail, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Briefcase
} from 'lucide-react';

export const CareersPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    roleInterest: 'Operations & Facility Management',
    challengeSolved: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const perks = [
    {
      icon: Award,
      title: 'Real Ownership',
      desc: 'Take responsibility, make decisions, and contribute directly to the success of our operations. We value people who take initiative and get things done.',
    },
    {
      icon: Layers,
      title: 'Modern Tools & Technology',
      desc: 'Work with digital tools, automation, and streamlined processes designed to make facility management more efficient and transparent.',
    },
    {
      icon: TrendingUp,
      title: 'Fast-Paced Growth',
      desc: 'As an early-stage company, your contribution matters. You will have opportunities to take on new responsibilities, learn across functions, and grow with the business.',
    },
    {
      icon: CheckCircle2,
      title: 'Meaningful Impact',
      desc: 'Your work directly influences how we serve clients, manage operations, and build a better facility management experience.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Application: ${formData.roleInterest} - ${formData.fullName}`);
    const body = encodeURIComponent(
      `Full Name: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nArea of Interest: ${formData.roleInterest}\n\nOperational Challenge Solved / Achievement:\n${formData.challengeSolved}\n\n(Please find my resume attached)`
    );
    window.location.href = `mailto:careers@taaskmate.com?subject=${subject}&body=${body}`;
    setIsSubmitted(true);
  };

  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-brand-navy text-white py-20 lg:py-28 overflow-hidden">
        {/* Background glow and subtle ambient pattern */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-brand-red/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-brand-red-medium/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/20 border border-brand-red/40 text-brand-red text-xs font-extrabold uppercase tracking-wider mb-6">
            <Briefcase className="w-3.5 h-3.5" /> Join Our Team
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Grow With Us. <br className="hidden sm:inline" />
            <span className="text-brand-red">Build What’s Next.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto font-normal mb-8">
            Facility management is changing, and we believe the industry deserves a smarter, faster, and more technology-driven approach.
          </p>

          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/15 p-6 sm:p-8 rounded-2xl text-left shadow-2xl">
            <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
              At <strong className="text-white font-bold">Taaskmate</strong>, we are building a modern facility management company focused on simplifying operations, improving service delivery, and creating better experiences for our clients. We combine technology, efficient processes, and strong on-ground execution to solve everyday facility challenges.
            </p>
          </div>
        </div>
      </section>

      {/* What You Get When You Join Taaskmate */}
      <section className="py-20 lg:py-24 bg-white border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red block mb-2">
              Why Join Taaskmate
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              What You Get When You Join Taaskmate
            </h2>
            <p className="text-base text-gray-600 mt-3">
              We empower team members with autonomy, clear systems, and the resources to do their best work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {perks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div 
                  key={idx}
                  className="p-8 rounded-2xl bg-[#F7F8F9] border border-gray-200/80 hover:border-brand-red hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-brand-red/10 text-brand-red group-hover:bg-brand-red group-hover:text-white flex items-center justify-center transition-all duration-300 mb-6 shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-red transition-colors mb-3">
                      {perk.title}
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="py-20 lg:py-24 bg-[#F7F8F9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-200/80">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-red block mb-2">
                Simple & Transparent
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
                How to Apply
              </h2>
              <p className="text-base sm:text-lg text-gray-700 font-medium mt-3">
                We keep our hiring process simple.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
                Send us your resume along with a short note telling us about one operational challenge you solved or an achievement you are proud of.
              </p>
            </div>

            {/* Direct Email Card */}
            <div className="bg-brand-red-soft/70 border border-brand-red/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-red text-white flex items-center justify-center shrink-0 shadow-md">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-brand-red">Direct Application Inbox</div>
                  <a 
                    href="mailto:careers@taaskmate.com" 
                    className="text-xl sm:text-2xl font-extrabold text-brand-navy hover:text-brand-red transition-colors"
                  >
                    careers@taaskmate.com
                  </a>
                </div>
              </div>

              <a
                href="mailto:careers@taaskmate.com?subject=Job%20Application%20-%20Taaskmate"
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-red hover:bg-brand-red-hover text-white font-bold text-sm rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Send Email Directly</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Application Quick Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-lg font-bold text-brand-navy border-b border-gray-100 pb-3">
                Or Send Your Details Below:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arun Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="arun@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Area of Interest *
                  </label>
                  <select
                    value={formData.roleInterest}
                    onChange={(e) => setFormData({ ...formData, roleInterest: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 bg-white font-medium text-brand-navy"
                  >
                    <option>Operations & Facility Management</option>
                    <option>Technical Engineering (Electrical / HVAC / Plumbing)</option>
                    <option>Interior Architecture & Project Management</option>
                    <option>Quality, Safety & Audits</option>
                    <option>Business Development & Enterprise Accounts</option>
                    <option>Technology & Operations Product</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  One Operational Challenge You Solved or Proud Achievement *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us briefly about an operational bottleneck you tackled, a project you executed, or a milestone you achieved..."
                  value={formData.challengeSolved}
                  onChange={(e) => setFormData({ ...formData, challengeSolved: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-brand-red hover:bg-brand-red-hover text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Note & Open Email Client</span>
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  This will pre-fill your application email directly to <strong>careers@taaskmate.com</strong> so you can easily attach your resume.
                </p>
              </div>

              {isSubmitted && (
                <div className="p-4 bg-brand-red-soft border border-brand-red/30 rounded-xl text-center text-sm font-semibold text-brand-red">
                  Thank you! Your email client has been opened. Please attach your resume to complete your application.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Inspiring Bottom CTA Banner */}
      <section className="py-16 bg-brand-navy text-white text-center border-t border-brand-navy-light/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
            Come build the future of facility management with Taaskmate.
          </h2>
          <p className="text-gray-300 text-base max-w-xl mx-auto mb-8">
            Take ownership, work with modern tools, and make a real difference across spaces in India.
          </p>
          <a
            href="mailto:careers@taaskmate.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-red hover:bg-brand-red-hover text-white font-bold text-base rounded-xl shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <span>Write to careers@taaskmate.com</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
};
