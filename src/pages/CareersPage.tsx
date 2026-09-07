import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  HeartHandshake, 
  GraduationCap, 
  ShieldCheck, 
  Send,
  X
} from 'lucide-react';

export const CareersPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

  const jobs = [
    {
      id: 'job-1',
      title: 'Senior Facility Manager',
      department: 'Operations',
      location: 'Bengaluru (ORR Tech Park)',
      experience: '5 - 8 Years',
      type: 'Full-time',
      desc: 'Lead a team of 40+ technicians and housekeeping staff across a 1M+ sq.ft Grade-A commercial tech park.'
    },
    {
      id: 'job-2',
      title: 'Lead Electrical Engineer',
      department: 'Technical Services',
      location: 'Mumbai (BKC)',
      experience: '3 - 6 Years',
      type: 'Full-time',
      desc: 'Oversee HT/LT substation maintenance, DG synchronization, UPS systems, and power quality compliance.'
    },
    {
      id: 'job-3',
      title: 'HVAC & Refrigeration Specialist',
      department: 'Technical Services',
      location: 'Hyderabad (Hitec City)',
      experience: '2 - 5 Years',
      type: 'Full-time',
      desc: 'Execute preventive maintenance and seasonal overhauls of centralized VRV/VRF chillers and AHUs.'
    },
    {
      id: 'job-4',
      title: 'Senior Interior Project Architect',
      department: 'Design & Build',
      location: 'Bengaluru (Indiranagar)',
      experience: '4 - 7 Years',
      type: 'Full-time',
      desc: 'Manage turnkey corporate and residential interior fit-outs from 3D conceptualization to site handover.'
    },
    {
      id: 'job-5',
      title: 'Corporate Client Relationship Manager',
      department: 'Business Development',
      location: 'Delhi NCR (Gurugram)',
      experience: '3 - 5 Years',
      type: 'Full-time',
      desc: 'Drive enterprise AMC contracts for tech parks, co-working operators, and healthcare groups.'
    },
    {
      id: 'job-6',
      title: 'Quality & Safety Audit Inspector',
      department: 'Compliance',
      location: 'Bengaluru (Multiple Sites)',
      experience: '2 - 4 Years',
      type: 'Full-time',
      desc: 'Conduct periodic EHS audits, fire hydrants readiness inspections, and statutory technician safety reviews.'
    },
  ];

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      setSelectedJob(null);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantEmail('');
    }, 2000);
  };

  return (
    <div className="bg-[#F7F8F9] min-h-screen">
      {/* Hero Banner */}
      <section className="bg-brand-navy text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-4 border border-brand-green/30">
            We Are Hiring
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Build Your Career With Taaskmate
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join a growing team committed to delivering reliable and innovative property services across India.
          </p>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-1.5">Health & Accident Cover</h3>
            <p className="text-xs text-gray-600">Comprehensive medical coverage for you and your direct dependents from day one.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-1.5">Taaskmate Academy</h3>
            <p className="text-xs text-gray-600">Paid certifications in advanced BMS systems, smart metering, and IoT facility tech.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-1.5">Meritocracy & Incentives</h3>
            <p className="text-xs text-gray-600">Quarterly performance bonuses, customer rating rewards, and accelerated leadership tracks.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-1.5">State-of-the-Art Tools</h3>
            <p className="text-xs text-gray-600">Work with mechanized modern tooling, automated ERP apps, and premium safety gear.</p>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
              Active Openings
            </span>
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
              Current Opportunities
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Showing {jobs.length} open roles across India
          </span>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[11px] font-bold text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded-full mb-3">
                  {job.department}
                </span>
                <h3 className="text-xl font-bold text-brand-navy mb-2">
                  {job.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {job.desc}
                </p>

                <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    <span>{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setSelectedJob(job.title)}
                  className="w-full py-2.5 bg-brand-navy hover:bg-brand-green text-white font-bold text-xs rounded-xl shadow transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {applied ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-brand-navy">Application Received!</h4>
                <p className="text-xs text-gray-600">
                  Thank you, {applicantName}. Our HR talent acquisition squad will review your profile for <strong>{selectedJob}</strong> and connect with you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">Job Application</span>
                  <h3 className="text-xl font-bold text-brand-navy">{selectedJob}</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Verma"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@example.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn Profile / Portfolio URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
