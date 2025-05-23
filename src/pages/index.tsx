import React, { useEffect, useState, ReactElement } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuthSwitch } from '../hooks/useAuthSwitch';
import Link from 'next/link';
import { useCallback } from 'react';
import { Layout as LayoutIcon, User, Target, Zap, Check, AlertCircle, ArrowRight, Mail } from 'react-feather';
import SatoshiIcon from '../components/SatoshiIcon';
import { NextPageWithLayout } from './_app';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
const Divider = ({ className }: { className?: string }) => <div className={`border-t ${className}`} />;

// Define the form schema
const waitlistFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  roles: z.object({
    advertiser: z.boolean().default(false),
    publisher: z.boolean().default(false),
    user: z.boolean().default(false),
  }).refine((data) => Object.values(data).some(Boolean), {
    message: "Please select at least one role you are interested in"
  })
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

const HomePage: NextPageWithLayout = () => {
  const { isAuthenticated, pubkey } = useAuthSwitch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    log?: boolean;
    message?: string;
  }>({});
  
  // Add state to track dev/production mode
  const [isDev, setIsDev] = useState(false);
  
  // Check if we're in dev mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First priority: Check for production environment variable
      if (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true') {
        setIsDev(false);
        console.log('HomePage - Production mode from environment variable');
        return;
      }
      
      const hostname = window.location.hostname;
      const simulateDev = localStorage.getItem('SIMULATE_DEV_DOMAIN') === 'true';
      
      // Local dev environment toggle takes priority for testing
      if (simulateDev === false) {
        setIsDev(false);
        console.log('HomePage - Production mode set from localStorage');
        return;
      }
      
      // Then check various environment indicators
      const isDevDomain = hostname.startsWith('dev.') || 
                         hostname.includes('replit.dev') ||
                         simulateDev ||
                         process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true';
      
      setIsDev(isDevDomain);
      console.log('HomePage - Mode check:', isDevDomain ? 'Development' : 'Production', 
        {hostname, simulateDev, replit: hostname.includes('replit.dev'), envVar: process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true'});
    }
  }, []);

  // Define form
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      email: "",
      roles: {
        advertiser: false,
        publisher: false,
        user: false
      }
    }
  });

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (isAuthenticated && pubkey) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, pubkey, router]);
  
  const onSubmit = async (data: WaitlistFormValues) => {
    setIsSubmitting(true);
    
    try {
      const selectedRoles = Object.entries(data.roles)
        .filter(([_, selected]) => selected)
        .map(([role]) => role);
      
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          interestedRoles: selectedRoles.join(',')
        }),
      });
      
      const responseData = await response.json();
      
      setSubmitStatus({
        log: responseData.log,
        message: responseData.log ? responseData.message : responseData.log
      });
      
      if (responseData.log) {
        // Reset form on log
        form.reset({
          email: "",
          roles: {
            advertiser: false,
            publisher: false,
            user: false
          }
        });
      }
    } catch (error) {
      console.log('Waitlist submission error:', error);
      setSubmitStatus({
        log: false,
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      title: 'Direct Advertising',
      description: 'Connect directly with publishers without intermediaries',
      icon: <Target className="h-8 w-8 text-blue-500" />,
    },
    {
      title: 'Lightning Payments',
      description: 'Instant micropayments with Bitcoin Lightning Network',
      icon: <Zap className="h-8 w-8 text-blue-500" />,
    },
    {
      title: 'User Data Control',
      description: 'Users control what data they share and get paid for it',
      icon: <User className="h-8 w-8 text-blue-500" />,
    },
    {
      title: 'Transparent Marketplace',
      description: 'Open platform built on Nostr protocol',
      icon: <LayoutIcon className="h-8 w-8 text-blue-500" />,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          <span className="block">
            <span className="text-blue-600">Create. Reach. </span>
            <span className="text-[#F7931A]">Earn.</span>
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Aligning advertisers, publishers, and viewers using Bitcoin Lightning payments 
          and the NOSTR protocol.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Get Early Access</CardTitle>
              </CardHeader>
              <CardContent>
                <Form onSubmit={form.handleSubmit(onSubmit)}>
                  {submitStatus.message && (
                    <Alert className={`mb-4 ${submitStatus.log ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-500' : 'bg-destructive/15 text-destructive border-destructive'}`}>
                      <div className="flex items-center">
                        {submitStatus.log ? 
                          <Check size={18} className="mr-2 text-green-500" /> : 
                          <AlertCircle size={18} className="mr-2 text-red-500" />
                        }
                        <AlertDescription>{submitStatus.message}</AlertDescription>
                      </div>
                    </Alert>
                  )}
                  
                  <div className="p-1 rounded-lg shadow-md" style={{backgroundColor: 'transparent'}}>                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email to join the waitlist"
                        className="flex h-10 w-full rounded-md border-2 border-blue-700 pl-10 shadow-md focus:border-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 text-base placeholder:text-gray-400 px-3 py-0.5 bg-transparent"
                        {...form.register("email")}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-red-500 mt-1 text-sm font-medium">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                
                  <div className="mt-6">
                    <div className="mb-2 font-medium">
                      I'm interested in (select all that apply):
                    </div>
                    <div className="space-y-3 p-4 rounded-md border-3 border-blue-500 dark:border-blue-600">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="role-advertiser"
                          className="h-5 w-5 rounded border-blue-600 text-blue-700 focus:ring-blue-500"
                          {...form.register("roles.advertiser")}
                        />
                        <label
                          htmlFor="role-advertiser"
                          className="text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          Advertiser - Create and run ad campaigns
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="role-publisher"
                          className="h-5 w-5 rounded border-blue-600 text-blue-700 focus:ring-blue-500"
                          {...form.register("roles.publisher")}
                        />
                        <label
                          htmlFor="role-publisher"
                          className="text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          Publisher - Monetize my website/content
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="role-user"
                          className="h-5 w-5 rounded border-blue-600 text-blue-700 focus:ring-blue-500"
                          {...form.register("roles.user")}
                        />
                        <label
                          htmlFor="role-user"
                          className="text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          Viewer - Earn bitcoin and control your own data
                        </label>
                      </div>
                    </div>
                    {form.formState.errors.roles && (
                      <p className="text-red-500 mt-1 text-sm font-medium">
                        {form.formState.errors.roles.message}
                      </p>
                    )}
                  </div>
                
                  {isDev ? (
                    <div className="flex items-center mt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg h-14 font-bold shadow-lg border-2 border-blue-700 transition-all hover:scale-[1.02]"
                        size="lg"
                      >
                        {isSubmitting ? 'Submitting...' : 'Get Early Access'} 
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  ) : null}
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      We'll notify you once access is available
                    </p>
                  </div>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Divider />

      <div className="w-full max-w-6xl py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          How It Works
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Divider />

      <div className="w-full max-w-4xl py-12 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          <span className="text-blue-600">Create. Reach. </span>
          <span className="text-[#F7931A]">Earn.</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Our platform creates value for everyone in the advertising ecosystem
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">Advertise</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 dark:text-gray-300 text-left space-y-2">
                <li>• Direct publisher access</li>
                <li>• Reduced CPMs </li>
                <li>• Censorship-resistant platform</li>
                <li>• Pay only for real engagement</li>
              </ul>
            </CardContent>
            <CardFooter>
              {isDev ? (
                <Link href="/advertiser" className="text-blue-600 hover:text-blue-700 inline-flex items-center font-medium">
                  Learn more →
                </Link>
              ) : (
                <span className="text-gray-400 cursor-not-allowed">Coming Soon</span>
              )}
            </CardFooter>
          </Card>
          
          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">Monetize</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 dark:text-gray-300 text-left space-y-2">
                <li>• Control your ad policies</li>
                <li>• Set your own rates</li>
                <li>• Instant Lightning payments</li>
                <li>• Direct advertiser relationships</li>
              </ul>
            </CardContent>
            <CardFooter>
              {isDev ? (
                <Link href="/publisher" className="text-blue-600 hover:text-blue-700 inline-flex items-center font-medium">
                  Learn more →
                </Link>
              ) : (
                <span className="text-gray-400 cursor-not-allowed">Coming Soon</span>
              )}
            </CardFooter>
          </Card>
          
          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">Earn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 dark:text-gray-300 text-left space-y-2">
                <li>• Own your data- choose what you share</li>
                <li>• Earn Sats for your attention</li>
                <li>• Block advertisers you dislike</li>
              </ul>
            </CardContent>
            <CardFooter>
              {isDev ? (
                <Link href="/viewer" className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium">
                  Learn more →
                </Link>
              ) : (
                <span className="text-gray-400 cursor-not-allowed">Coming Soon</span>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Define a custom layout for the HomePage to prevent duplicate navbars
HomePage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="Nostr Ad Marketplace - Home">
      {page}
    </Layout>
  );
};

export default HomePage;