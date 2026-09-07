import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { servicesList } from '../data/servicesData';
import { ServiceIcon } from './ServiceIcon';

interface NavbarProps {
  onOpenQuote: (serviceName?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuote }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const dropdownTimerRef = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsMobileServicesOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = window.setTimeout(() => {
      setIsServicesOpen(false);
    }, 150);
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative text-[14px] 2xl:text-[15px] whitespace-nowrap font-medium transition-colors duration-200 hover:text-brand-green py-2 ${
      isActive ? 'text-brand-green font-semibold' : 'text-gray-700'
    }`;

  return (
    <>
      {/* Top micro-bar for quick contact */}
      <div className="bg-brand-navy text-gray-300 text-xs hidden lg:block border-b border-brand-navy-light/40 py-2 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center whitespace-nowrap">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              <span className="text-gray-400">24/7 Helpline:</span>
              <a href="tel:+918045678900" className="text-white hover:text-brand-green font-semibold transition-colors">
                +91 80 4567 8900
              </a>
            </span>
            <span className="text-gray-600">|</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gray-400">Email:</span>
              <a href="mailto:support@taaskmate.com" className="text-white hover:text-brand-green font-medium transition-colors">
                support@taaskmate.com
              </a>
            </span>
          </div>

          <div className="flex items-center gap-5 text-gray-400">
            <Link to="/partner-with-us" className="text-brand-green hover:underline font-semibold flex items-center gap-1">
              <span>Join as Partner</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/login" className="text-gray-300 hover:text-brand-green font-medium flex items-center gap-1 transition-colors">
              <span>ERP Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-md py-3' : 'py-4 border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo with right spacing */}
          <div className="shrink-0 pr-2 xl:pr-6">
            <Logo variant="dark" showTagline={false} size="md" />
          </div>

          {/* Desktop Navigation - strictly single line with nowrap */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-7 whitespace-nowrap">
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`flex items-center gap-1 text-[14px] 2xl:text-[15px] whitespace-nowrap font-medium transition-colors duration-200 hover:text-brand-green py-2 cursor-pointer ${
                  location.pathname.startsWith('/services') ? 'text-brand-green font-semibold' : 'text-gray-700'
                }`}
                onClick={() => setIsServicesOpen(!isServicesOpen)}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isServicesOpen ? 'rotate-180 text-brand-green' : 'text-gray-500'
                  }`}
                />
              </button>

              {/* Mega Dropdown Menu */}
              {isServicesOpen && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-white rounded-2xl shadow-dropdown border border-gray-100 p-6 transition-all duration-200 animate-fadeIn"
                >
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                        All 12 Core Services
                      </h4>
                      <p className="text-xs text-gray-500">End-to-end residential & corporate facility solutions</p>
                    </div>
                    <Link
                      to="/services"
                      onClick={() => setIsServicesOpen(false)}
                      className="text-xs font-semibold text-brand-green hover:text-brand-green-hover flex items-center gap-1"
                    >
                      <span>View All Services</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {servicesList.map((service) => (
                      <Link
                        key={service.id}
                        to={`/services#${service.slug}`}
                        onClick={() => setIsServicesOpen(false)}
                        className="group/item flex items-start gap-2.5 p-2 rounded-xl hover:bg-brand-green-light/40 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 group-hover/item:bg-brand-green group-hover/item:text-white transition-colors mt-0.5">
                          <ServiceIcon name={service.icon} size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold text-gray-800 group-hover/item:text-brand-green transition-colors truncate">
                            {service.name}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">
                            {service.turnaroundTime}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-3 rounded-b-2xl flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Looking for custom AMC or multi-property contract?
                    </div>
                    <button
                      onClick={() => {
                        setIsServicesOpen(false);
                        onOpenQuote();
                      }}
                      className="text-xs font-bold text-brand-navy hover:text-brand-green flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-green" /> Get Custom Quote
                    </button>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/property-management" className={navLinkClasses}>
              Property Management
            </NavLink>

            <NavLink to="/interior-design" className={navLinkClasses}>
              Interior Design
            </NavLink>

            <NavLink to="/about" className={navLinkClasses}>
              About Us
            </NavLink>

            <NavLink to="/careers" className={navLinkClasses}>
              Careers
            </NavLink>

            <NavLink to="/partner-with-us" className={navLinkClasses}>
              Partner With Us
            </NavLink>

            <NavLink to="/contact" className={navLinkClasses}>
              Contact Us
            </NavLink>
          </nav>

          {/* Header Action Button - Single line nowrap */}
          <div className="hidden sm:flex items-center shrink-0 pl-2">
            <button
              onClick={() => onOpenQuote()}
              className="whitespace-nowrap px-4 xl:px-5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs xl:text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Get a Quote</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-brand-green hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-xl max-h-[85vh] overflow-y-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              Home
            </NavLink>

            {/* Mobile Services Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-medium text-gray-800 hover:bg-gray-50"
              >
                <span>Services (12)</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isMobileServicesOpen ? 'rotate-180 text-brand-green' : 'text-gray-400'
                  }`}
                />
              </button>

              {isMobileServicesOpen && (
                <div className="pl-3 pr-2 py-2 space-y-1.5 bg-gray-50 rounded-xl my-1">
                  <Link
                    to="/services"
                    className="block py-1 text-xs font-bold text-brand-green hover:underline"
                  >
                    → Browse All Services Overview
                  </Link>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {servicesList.map((service) => (
                      <Link
                        key={service.id}
                        to={`/services#${service.slug}`}
                        className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs text-gray-700 hover:text-brand-green hover:bg-white"
                      >
                        <ServiceIcon name={service.icon} size={14} className="text-brand-green" />
                        <span className="truncate">{service.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/property-management"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              Property Management
            </NavLink>

            <NavLink
              to="/interior-design"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              Interior Design
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              About Us
            </NavLink>

            <NavLink
              to="/careers"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              Careers
            </NavLink>

            <NavLink
              to="/partner-with-us"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              Partner With Us
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              Contact Us
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-brand-green-light text-brand-green font-semibold' : 'text-gray-800'
                }`
              }
            >
              Staff ERP Portal
            </NavLink>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenQuote();
                }}
                className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-center rounded-xl shadow-sm cursor-pointer"
              >
                Get a Free Quote
              </button>
              <a
                href="tel:+918045678900"
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-brand-navy border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <Phone className="w-4 h-4 text-brand-green" /> Call +91 80 4567 8900
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
