import React, { useEffect, useState, ReactElement } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuthSwitch } from '../hooks/useAuthSwitch';
import Link from 'next/link';
import { Layout as LayoutIcon, User, Target, Zap, Check, AlertCircle, ArrowRight, Mail } from 'react-feather';
import SatoshiIcon from '../components/SatoshiIcon';
import { NextPageWithLayout } from './_app';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import Divider from '@/components/ui/Divider';

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
    success?: boolean;
    message?: string;
  }>({});

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
        success: responseData.success,
        message: responseData.success ? responseData.message : responseData.error
      });
      
      if (responseData.success) {
        // Reset form on success
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
      console.error('Waitlist submission error:', error);
      setSubmitStatus({
        success: false,
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
      icon: <Target className="h-8 w-8 text-purple-500" />,
    },
    {
      title: 'Lightning Payments',
      description: 'Instant micropayments with Bitcoin Lightning Network',
      icon: <Zap className="h-8 w-8 text-purple-500" />,
    },
    {
      title: 'User Data Control',
      description: 'Users control what data they share and get paid for it',
      icon: <User className="h-8 w-8 text-purple-500" />,
    },
    {
      title: 'Transparent Marketplace',
      description: 'Open platform built on Nostr protocol',
      icon: <LayoutIcon className="h-8 w-8 text-purple-500" />,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          <span className="block">Nostr Ad Marketplace</span>
          <span className="block text-purple-600">Monetize. Advertise. Earn.</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          A decentralized platform connecting advertisers, publishers, and viewers
          using the Nostr protocol and Lightning Network payments.
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
                    <Alert className={`mb-4 ${submitStatus.success ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-500' : 'bg-destructive/15 text-destructive border-destructive'}`}>
                      <div className="flex items-center">
                        {submitStatus.success ? 
                          <Check size={18} className="mr-2 text-green-500" /> : 
                          <AlertCircle size={18} className="mr-2 text-red-500" />
                        }
                        <AlertDescription>{submitStatus.message}</AlertDescription>
                      </div>
                    </Alert>
                  )}
                  
                  <div className="p-4 rounded-lg shadow-md" style={{backgroundColor: '#e5e7eb'}}>                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email to join the waitlist"
                        className="flex h-10 w-full rounded-md border-2 border-purple-700 pl-10 shadow-md focus:border-purple-800 focus-visible:ring-2 focus-visible:ring-purple-600 text-base placeholder:text-gray-200 px-3 py-2 bg-gray-200"
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
                    <div className="space-y-3 p-4 rounded-md border-3 border-purple-500 dark:border-purple-600">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="role-advertiser"
                          className="h-5 w-5 rounded border-purple-600 text-purple-700 focus:ring-purple-500"
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
                          className="h-5 w-5 rounded border-purple-600 text-purple-700 focus:ring-purple-500"
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
                          className="h-5 w-5 rounded border-purple-600 text-purple-700 focus:ring-purple-500"
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
                
                  <div className="flex items-center mt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-purple-800 hover:bg-purple-900 text-white text-lg h-14 font-bold shadow-lg border-2 border-purple-900 transition-all hover:scale-[1.02]"
                      size="lg"
                    >
                      {isSubmitting ? 'Submitting...' : 'Get Early Access'} 
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Already have access? <Link href="/login-new" className="text-purple-600 hover:text-purple-800">Login</Link>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <Link href="/admin-fix.html" className="text-purple-600 hover:text-purple-800">Admin Access Tool</Link>
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
                <div className="mb-4">{feature.icon}</div>
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
          Monetize. Advertise. Earn.
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Our platform creates value for everyone in the advertising ecosystem
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-l-4 border-l-purple-600 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl text-purple-600">Advertise</CardTitle>
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
              <Link href="/advertiser" className="text-purple-600 hover:text-purple-800 inline-flex items-center font-medium">
                Learn more →
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl text-green-600">Monetize</CardTitle>
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
              <Link href="/publisher" className="text-green-600 hover:text-green-800 inline-flex items-center font-medium">
                Learn more →
              </Link>
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
              <Link href="/viewer" className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium">
                Learn more →
              </Link>
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