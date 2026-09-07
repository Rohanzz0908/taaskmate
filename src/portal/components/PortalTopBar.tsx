import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Bell, 
  LogOut, 
  User, 
  ChevronDown,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PortalTopBarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

export const PortalTopBar: React.FC<PortalTopBarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenMobile
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current page title & category
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/portal') return { section: 'Overview', title: 'Dashboard', subtitle: 'Real-time operational summary & business metrics' };
    if (path === '/portal/category-master') return { section: 'Masters', title: 'Category Master', subtitle: 'Manage procurement categories, UOM standards, and item classifications' };
    if (path === '/portal/client-master') return { section: 'Masters', title: 'Client Master', subtitle: 'Customer and enterprise directory with GSTIN compliance' };
    if (path === '/portal/quotation') return { section: 'Transactions', title: 'Create Quotation', subtitle: 'Commercial proposals with dynamic line item calculations' };
    if (path.startsWith('/portal/quotation/edit/')) return { section: 'Transactions', title: 'Edit Quotation', subtitle: 'Modify existing commercial estimate' };
    if (path === '/portal/quotations') return { section: 'Reports', title: 'Quotation Reports', subtitle: 'Commercial proposals directory, status tracking, and audit logs' };
    if (path.startsWith('/portal/quotation/')) return { section: 'Reports', title: 'Quotation Preview', subtitle: 'Print-ready executive commercial proposal' };
    return { section: 'Portal', title: 'Management Console', subtitle: 'Taaskmate Enterprise Operations' };
  };

  const { section, title, subtitle } = getPageInfo();

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Toggles & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1"></div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>{section}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-700 font-semibold">{title}</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00C878] rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-4 w-px bg-slate-200"></div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-[#0A1620] text-[#00C878] flex items-center justify-center font-bold text-xs border border-[#00C878]/30">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold text-slate-800">{user?.name || 'Test Admin'}</div>
              <div className="text-[10px] text-slate-400">{user?.role || 'Administrator'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 animate-fadeIn"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="p-2.5 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-800">{user?.name || 'Test Admin'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@taaskmate.com'}</div>
                <div className="mt-1.5 inline-block text-[10px] font-semibold text-[#00C878] bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  {user?.role || 'Administrator'}
                </div>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 hover:text-[#00C878] hover:bg-emerald-50/50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Public Website</span>
              </a>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
