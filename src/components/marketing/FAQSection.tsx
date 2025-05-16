import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQSectionProps {
  title: string;
  subtitle?: string;
  faqs: FAQItem[];
  backgroundColor?: string;
  maxItems?: number;
}

const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  subtitle,
  faqs,
  backgroundColor = 'bg-white dark:bg-gray-900',
  maxItems = faqs.length,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);
  
  const displayItems = showMore ? faqs : faqs.slice(0, maxItems);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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

        <div className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-700">
          {displayItems.map((faq, index) => (
            <div key={index} className="py-5">
              <button
                onClick={() => toggleQuestion(index)}
                className="flex justify-between w-full text-left"
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                <span className="ml-6 flex-shrink-0 text-purple-600 dark:text-purple-400">
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>
              {openIndex === index && (
                <div className="mt-3 text-base text-gray-600 dark:text-gray-300">
                  {typeof faq.answer === 'string' ? (
                    <p>{faq.answer}</p>
                  ) : (
                    faq.answer
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {faqs.length > maxItems && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-4 py-2 text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20 transition-colors"
            >
              {showMore ? 'Show Less' : `Show More (${faqs.length - maxItems} more)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;