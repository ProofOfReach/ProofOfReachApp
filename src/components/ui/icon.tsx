import React from 'react';
import { 
  Home, Settings, User, BarChart2, FileText,
  Shield, Edit3, DollarSign, Code, CheckSquare, 
  PieChart, LogOut, Menu, X
} from 'react-feather';
import "./components/icons/MegaphoneIcon';
import "./components/icons/SatsIcon';
import "./components/icons/BitcoinIcon';
import "./lib/navigationBuilder';
import "./lib/utils';

export interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Icon component that renders different icons based on the provided name
 * Works with our navigation builder to create consistent icons
 */
const Icon: React.FC<IconProps> = ({ 
  name, 
  className, 
  size = 24, 
  color 
}) => {
  const getIcon = () => {
    switch (name) {
      case 'home':
        return <Home size={size} className={className} color={color} />;
      case 'settings':
        return <Settings size={size} className={className} color={color} />;
      case 'viewer':
        return <User size={size} className={className} color={color} />;
      case 'chart':
        return <BarChart2 size={size} className={className} color={color} />;
      case 'file':
        return <FileText size={size} className={className} color={color} />;
      case 'shield':
        return <Shield size={size} className={className} color={color} />;
      case 'edit':
        return <Edit3 size={size} className={className} color={color} />;
      case 'dollar':
        return <DollarSign size={size} className={className} color={color} />;
      case 'code':
        return <Code size={size} className={className} color={color} />;
      case 'check':
        return <CheckSquare size={size} className={className} color={color} />;
      case 'pie':
        return <PieChart size={size} className={className} color={color} />;
      case 'logout':
        return <LogOut size={size} className={className} color={color} />;
      case 'megaphone':
        return <MegaphoneIcon className={cn('w-5 h-5', className)} />;
      case 'sats':
        return <SatsIcon className={cn('w-5 h-5', className)} />;
      case 'bitcoin':
        return <BitcoinIcon className={cn('w-5 h-5', className)} />;
      default:
        return <span className="text-red-500">Missing icon: {name}</span>;
    }
  };

  return (
    <span className="inline-flex" data-testid={`icon-${name}`}>
      {getIcon()}
    </span>
  );
};

export default Icon;