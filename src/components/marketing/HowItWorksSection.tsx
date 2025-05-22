import React from 'react';

interface Step {
  title: string;
  description: string;
  number: number;
  icon?: React.ReactNode;
}

interface HowItWorksSectionProps {
  title: string;
  subtitle?: string;
  steps: Step[];
  backgroundColor?: string;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  title,
  subtitle,
  steps,
  backgroundColor = 'bg-gray-50 dark:bg-gray-800'
}) => {
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

        <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-xl mb-5">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
              
              {/* Connection line between steps (visible on desktop) */}
              {step.number < steps.length && (
                <div className="hidden lg:block absolute top-6 left-[calc(100%_-_16px)] w-16 h-0.5 bg-purple-300 dark:bg-purple-700"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;