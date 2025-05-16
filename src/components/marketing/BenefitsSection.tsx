import React from 'react';

interface Benefit {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface BenefitsSectionProps {
  title: string;
  subtitle?: string;
  benefits: Benefit[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  title,
  subtitle,
  benefits,
  columns = 3,
  backgroundColor = 'bg-white dark:bg-gray-900'
}) => {
  const getColumnClass = () => {
    switch (columns) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-2 lg:grid-cols-4';
      default: return 'md:grid-cols-3';
    }
  };

  return (
    <section className={`py-12 md:py-20 ${backgroundColor}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`grid grid-cols-1 ${getColumnClass()} gap-8`}>
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {benefit.icon && (
                <div className="mb-4 text-purple-600 dark:text-purple-400">
                  {benefit.icon}
                </div>
              )}
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;