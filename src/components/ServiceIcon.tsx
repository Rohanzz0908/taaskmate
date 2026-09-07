import React from 'react';
import {
  Wrench,
  Hammer,
  Tv,
  Paintbrush,
  Zap,
  ShieldCheck,
  Sparkles,
  Users,
  Flame,
  FileCheck,
  Cog,
  Building,
  Home,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Star,
  Check,
  Briefcase,
  Layers,
  Award,
  HardHat,
  Compass,
  FileText
} from 'lucide-react';

interface ServiceIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = "w-6 h-6", size = 24 }) => {
  switch (name) {
    case 'Wrench': return <Wrench className={className} size={size} />;
    case 'Hammer': return <Hammer className={className} size={size} />;
    case 'Tv': return <Tv className={className} size={size} />;
    case 'Paintbrush': return <Paintbrush className={className} size={size} />;
    case 'Zap': return <Zap className={className} size={size} />;
    case 'ShieldCheck': return <ShieldCheck className={className} size={size} />;
    case 'Drill': return <HardHat className={className} size={size} />;
    case 'Sparkles': return <Sparkles className={className} size={size} />;
    case 'Users': return <Users className={className} size={size} />;
    case 'Flame': return <Flame className={className} size={size} />;
    case 'FileCheck': return <FileCheck className={className} size={size} />;
    case 'Cog': return <Cog className={className} size={size} />;
    case 'Building': return <Building className={className} size={size} />;
    case 'Home': return <Home className={className} size={size} />;
    case 'CheckCircle2': return <CheckCircle2 className={className} size={size} />;
    case 'Clock': return <Clock className={className} size={size} />;
    case 'Compass': return <Compass className={className} size={size} />;
    default: return <Wrench className={className} size={size} />;
  }
};
