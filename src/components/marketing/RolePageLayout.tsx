import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'react-feather';
import Layout from '../Layout';

interface RolePageLayoutProps {
  children: ReactNode;
  title: string;
  roleName: string;
  roleColor?: string;
}

const RolePageLayout: React.FC<RolePageLayoutProps> = ({
  children,
  title,
  roleName,
  roleColor = 'bg-purple-600',
}) => {
  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Role badge */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-end">
            <div className={`px-3 py-1 rounded-full ${roleColor} text-white text-sm font-medium`}>
              {roleName}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center mt-8 mb-4 text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
        
        {/* Page content */}
        <div className="pb-12">
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default RolePageLayout;