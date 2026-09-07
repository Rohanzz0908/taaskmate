import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
  company: string;
  rating: number;
}

export const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      text: "Taaskmate made managing our property maintenance incredibly simple. Their team was professional, responsive and completed everything on time with zero operational friction.",
      name: "Rahul M.",
      role: "Property Manager",
      company: "Prestige Cyber Park, Bengaluru",
      rating: 5,
    },
    {
      id: 2,
      text: "I had a great experience with Taaskmate AC & Electrical Services. They were professional, efficient, and affordable. I would definitely recommend them to anyone managing large residential communities.",
      name: "Jay Raj",
      role: "RWA Secretary",
      company: "Greenwoods Gated Community",
      rating: 5,
    },
    {
      id: 3,
      text: "I was so impressed with the deep sanitization and mechanized floor scrubbing that Taaskmate did for our healthcare facility. They went above and beyond, and our clinic looks pristine!",
      name: "Sharada K.",
      role: "Healthcare Facility Manager",
      company: "Apex Wellness Clinics",
      rating: 5,
    },
    {
      id: 4,
      text: "During our corporate office relocation, we required swift electrical rewiring and interior carpentry. Taaskmate handled everything seamlessly under a tight 48-hour deadline.",
      name: "Venkat S.",
      role: "Facilities Director",
      company: "NovaTech Solutions",
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="relative py-24 bg-brand-navy overflow-hidden">
      {/* Large Backdrop Image Related to Maintenance/Tools/Properties */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80"
          alt="Facility engineering tools background"
          className="w-full h-full object-cover opacity-20 filter contrast-125"
        />
        <div className="absolute inset-0 bg-brand-navy/85 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 border border-brand-green/40 text-brand-green text-xs font-bold uppercase tracking-wider mb-3">
            Client Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What Our Partners Say
          </h2>
          <p className="text-gray-300 text-sm sm:text-base mt-2">
            Trusted by facility managers, builders, and thousands of satisfied property owners.
          </p>
        </div>

        {/* Floating White Testimonial Card over image */}
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-2xl border border-gray-100 relative">
            {/* Top Quote Icon */}
            <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-6">
              <Quote className="w-6 h-6" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(current.rating)].map((_, idx) => (
                <Star key={idx} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <blockquote className="text-lg sm:text-xl text-gray-800 font-medium leading-relaxed mb-8 min-h-[90px]">
              “{current.text}”
            </blockquote>

            {/* Author Info & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-100 gap-4">
              <div>
                <h4 className="text-lg font-bold text-brand-navy">{current.name}</h4>
                <p className="text-sm font-semibold text-brand-green">{current.role}</p>
                <p className="text-xs text-gray-500">{current.company}</p>
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border border-gray-300 hover:border-brand-green hover:bg-brand-green hover:text-white text-gray-700 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-gray-300 hover:border-brand-green hover:bg-brand-green hover:text-white text-gray-700 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Bullet Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-brand-green' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
