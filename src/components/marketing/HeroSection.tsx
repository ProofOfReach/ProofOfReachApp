import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  imagePlacement?: 'right' | 'left';
  backgroundColor?: string;
  textColor?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  imageUrl,
  imagePlacement = 'right',
  backgroundColor = 'bg-gradient-to-r from-purple-700 to-purple-800',
  textColor = 'text-white'
}) => {
  return (
    <div className={`w-full py-12 md:py-24 ${backgroundColor}`}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${imagePlacement === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center`}>
          <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${textColor} opacity-80 mb-2`}>
              {subtitle}
            </h2>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${textColor} mb-4 leading-tight`}>
              {title}
            </h1>
            <p className={`text-base md:text-lg ${textColor} opacity-90 mb-6 max-w-lg mx-auto md:mx-0`}>
              {description}
            </p>
            <Link 
              href={ctaLink}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors font-bold"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          {imageUrl && (
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <img 
                src={imageUrl} 
                alt="Hero illustration"
                className="max-w-full h-auto rounded-lg shadow-lg" 
                style={{ maxHeight: '250px', width: 'auto' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;