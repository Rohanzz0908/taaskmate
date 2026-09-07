import React from 'react';
import { ClipboardList, Search, FileCheck2, CheckCircle } from 'lucide-react';

export const ProcessFlow: React.FC = () => {
  const steps = [
    {
      step: 'STEP 1',
      title: 'Raise a Request',
      desc: 'Tell us what service you need.',
      icon: ClipboardList,
    },
    {
      step: 'STEP 2',
      title: 'Site Inspection',
      desc: 'Our team assesses the requirement.',
      icon: Search,
    },
    {
      step: 'STEP 3',
      title: 'Get a Quote',
      desc: 'Receive a clear quotation and approve the service.',
      icon: FileCheck2,
    },
    {
      step: 'STEP 4',
      title: 'Service Delivered',
      desc: 'Our professionals complete the task efficiently.',
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-3">
            Streamlined Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mb-4">
            How Taaskmate Works
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Four simple steps from booking to guaranteed hassle-free completion.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Horizontal Green Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-1 bg-brand-green/30 z-0">
            <div className="h-full bg-brand-green w-full rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step Badge */}
                  <span className="text-xs font-extrabold tracking-widest text-brand-green mb-3 uppercase bg-brand-green-light px-2.5 py-1 rounded-full">
                    {item.step}
                  </span>

                  {/* Large Green Circular Icon */}
                  <div className="w-24 h-24 rounded-full bg-brand-green text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ring-8 ring-white mb-5">
                    <Icon className="w-10 h-10" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-brand-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 max-w-[220px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
