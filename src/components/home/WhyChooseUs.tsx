import React from 'react';
import whyChooseUsImg from '../../assets/why_choose_us.jpg';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      num: '1',
      title: 'Bespoke Solutions',
      desc: 'Service solutions tailored to your specific requirements and operational needs.',
    },
    {
      num: '2',
      title: 'Dependable Delivery',
      desc: 'Prompt, professional, and consistent service you can rely on.',
    },
    {
      num: '3',
      title: 'Proven Expertise',
      desc: 'Skilled and experienced professionals committed to quality workmanship.',
    },
    {
      num: '4',
      title: 'Smarter Approach',
      desc: 'Modern tools and efficient processes for seamless and effective service delivery.',
    },
    {
      num: '5',
      title: 'Client-Centric Service',
      desc: 'We put your requirements, convenience, safety, and satisfaction at the heart of every service.',
    },
  ];

  return (
    <section className="py-20 bg-[#F7F8F9] border-y border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <img
                src={whyChooseUsImg}
                alt="Taaskmate engineers monitoring smart facility operations"
                className="w-full h-[450px] sm:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg">
                <div className="text-xs uppercase font-bold tracking-wider text-brand-green mb-1">Guaranteed Quality</div>
                <div className="text-sm font-extrabold text-brand-navy">High First-Visit Resolution Rate with Certified Experts</div>
              </div>
            </div>
          </div>

          {/* Right Column: Numbered Points */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
                Why Choose Us?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mt-2 mb-4">
                Your Trusted Partner for Better Facility Management
              </h2>
            </div>

            {/* 5 Numbered Benefits */}
            <div className="space-y-4 pt-2">
              {points.map((pt) => (
                <div
                  key={pt.num}
                  className="flex items-start gap-4 p-3.5 rounded-xl bg-white/60 hover:bg-white border border-transparent hover:border-gray-200/80 transition-all duration-200 shadow-none hover:shadow-sm"
                >
                  {/* Green Circular Number Icon */}
                  <div className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center font-extrabold text-base shrink-0 shadow-md">
                    {pt.num}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy leading-snug">
                      {pt.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
