import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  User,
  Wrench,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PortalSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const [isMastersOpen, setIsMastersOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Ultra-refined enterprise active nav item style
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
      isActive 
        ? 'bg-[#00C878]/15 text-[#00C878] font-semibold ring-1 ring-[#00C878]/25 shadow-sm' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A1620] text-slate-300 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#122838] to-[#0A1620] border border-[#00C878]/30 flex items-center justify-center text-[#00C878] shrink-0 shadow-sm">
            <svg viewBox="0 0 36 36" fill="none" className="w-4 h-4">
              <path 
                d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" 
                stroke="#00C878" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="opacity-40"
              />
              <path 
                d="M11 18.5L16 23.5L25 13.5" 
                stroke="#00C878" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <div className="font-bold text-white text-sm tracking-tight flex items-center">
                <span>Taask</span>
                <span className="text-[#00C878]">mate</span>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                ERP Management
              </span>
            </div>
          )}
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 py-4 px-2.5 space-y-5 overflow-y-auto scrollbar-none">
        {/* Main Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Overview
            </div>
          )}
          <NavLink to="/portal" end className={navItemClass}>
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
        </div>

        {/* Masters Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <button
              onClick={() => setIsMastersOpen(!isMastersOpen)}
              className="w-full flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 hover:text-slate-300 transition-colors"
            >
              <span>Masters</span>
              {isMastersOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
            </button>
          )}

          {(isMastersOpen || isCollapsed) && (
            <div className="space-y-1">
              <NavLink to="/portal/category-master" className={navItemClass}>
                <FolderKanban className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Category Master</span>}
              </NavLink>

              <NavLink to="/portal/client-master" className={navItemClass}>
                <Users className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Client Master</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Transactions Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Transactions
            </div>
          )}
          <NavLink to="/portal/quotation" className={navItemClass}>
            <FileText className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Create Quotation</span>}
          </NavLink>
          <NavLink to="/portal/service-report" className={navItemClass}>
            <Wrench className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Service Report</span>}
          </NavLink>
          <NavLink to="/portal/invoice" className={navItemClass}>
            <Receipt className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Issue Invoice</span>}
          </NavLink>
        </div>

        {/* Reports Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Reports & Logs
            </div>
          )}
          <NavLink to="/portal/quotations" className={navItemClass}>
            <BarChart3 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Quotation Logs</span>}
          </NavLink>
          <NavLink to="/portal/service-reports" className={navItemClass}>
            <Wrench className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Service Reports</span>}
          </NavLink>
          <NavLink to="/portal/invoices" className={navItemClass}>
            <Receipt className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Tax Invoices</span>}
          </NavLink>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Link to public website */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span className="truncate">View Public Website</span>}
        </a>

        {/* User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.03] border border-slate-800">
          <div className="w-7 h-7 rounded-md bg-[#162D3E] text-[#00C878] flex items-center justify-center shrink-0 border border-[#00C878]/20">
            <User className="w-3.5 h-3.5" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 leading-tight">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Test Admin'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.role || 'Administrator'}</div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-200 z-30 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
