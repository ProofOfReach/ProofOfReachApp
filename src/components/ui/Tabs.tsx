import React from 'react';
import Tab from './Tab';

interface TabsProps {
  children?: React.ReactNode;
  className?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  tabs?: Array<{ id: string; label: string }>;
}

const Tabs: React.FC<TabsProps> = ({ 
  children, 
  className = '',
  activeTab,
  onChange,
  tabs
}) => {
  // If using the component API with children
  if (children) {
    return (
      <div className={`flex border-b ${className}`}>
        {children}
      </div>
    );
  }
  
  // If using the props API with tabs array
  if (tabs && activeTab && onChange) {
    return (
      <div className={`flex border-b ${className}`}>
        {tabs.map(tab => (
          <Tab 
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </div>
    );
  }
  
  // Fallback empty state
  return <div className={className}></div>;
};

export default Tabs;