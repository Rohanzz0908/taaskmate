import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy text-gray-300 pt-16 pb-12 border-t border-brand-navy-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4">
            <Logo variant="light" showTagline={true} size="md" />
            <p className="text-sm text-gray-400 leading-relaxed pt-2">
              Taaskmate is India's leading on-demand facility management and property services company, providing integrated engineering, maintenance, housekeeping, and turnkey interior solutions for modern spaces.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-md border border-brand-green/20">
                <ShieldCheck className="w-3.5 h-3.5" /> ISO 9001:2015
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                Pan-India SLA 99.4%
              </span>
            </div>
          </div>

          {/* Column 2: Our Services */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green"></span>
              Our Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services#plumbing" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  Plumbing & Sanitation
                </Link>
              </li>
              <li>
                <Link to="/services#electrical" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  Electrical & Power Systems
                </Link>
              </li>
              <li>
                <Link to="/services#carpentry" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  Carpentry & Fit-outs
                </Link>
              </li>
              <li>
                <Link to="/services#cleaning" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  Deep Cleaning & Housekeeping
                </Link>
              </li>
              <li>
                <Link to="/services#painting" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  Painting & Waterproofing
                </Link>
              </li>
              <li>
                <Link to="/services#pest-control" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  Pest Control & Disinfection
                </Link>
              </li>
              <li>
                <Link to="/services#amc" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  AMC Facility Contracts
                </Link>
              </li>
              <li>
                <Link to="/services#renovation" className="hover:text-brand-green transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-brand-green"></span>
                  Renovation & Remodeling
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-green transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-green transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-brand-green transition-colors">All Services Catalog</Link>
              </li>
              <li>
                <Link to="/property-management" className="hover:text-brand-green transition-colors">Property Management</Link>
              </li>
              <li>
                <Link to="/interior-design" className="hover:text-brand-green transition-colors">Interior Design</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-brand-green transition-colors flex items-center gap-2">
                  Careers <span className="text-[10px] bg-brand-green text-brand-navy font-bold px-1.5 py-0.5 rounded">Hiring</span>
                </Link>
              </li>
              <li>
                <Link to="/partner-with-us" className="hover:text-brand-green transition-colors">Partner With Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-green transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-brand-green transition-colors text-xs font-semibold flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                  Staff / ERP Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green"></span>
              Contact Us
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  Taaskmate Facility Towers, #42, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-green shrink-0" />
                <a href="tel:+918045678900" className="hover:text-brand-green text-gray-300 font-medium">
                  +91 80 4567 8900 / +91 99000 12345
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-green shrink-0" />
                <a href="mailto:support@taaskmate.com" className="hover:text-brand-green text-gray-300">
                  support@taaskmate.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-gray-400">24/7 Operations & Helpdesk Support</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Connect With Us</p>
              <div className="flex items-center gap-2.5">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-green hover:text-white flex items-center justify-center transition-all text-gray-400"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-green hover:text-white flex items-center justify-center transition-all text-gray-400"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-green hover:text-white flex items-center justify-center transition-all text-gray-400"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-green hover:text-white flex items-center justify-center transition-all text-gray-400"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136c-1.871-.502-9.376-.502-9.376-.502s-7.504 0-9.377.502a3.016 3.016 0 0 0-2.122 2.136c-.5 1.874-.5 5.786-.5 5.786s0 3.913.5 5.787a3.016 3.016 0 0 0 2.122 2.135c1.873.502 9.377.502 9.377.502s7.505 0 9.377-.502a3.016 3.016 0 0 0 2.122-2.135c.5-1.874.5-5.787.5-5.787s0-3.912-.5-5.786zm-14.498 9.314v-6.998l6.19 3.499-6.19 3.499z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Taaskmate Services Private Limited. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-brand-green transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-brand-green transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-brand-green transition-colors">Security & SLA</Link>
            <Link to="/partner-with-us" className="hover:text-brand-green transition-colors">Vendor Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
