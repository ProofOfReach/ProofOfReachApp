import React, { useState } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdvertiserOnboardingProps {
  currentStep: OnboardingStep;
}

const AdvertiserOnboarding: React.FC<AdvertiserOnboardingProps> = ({ currentStep }) => {
  const [campaignName, setCampaignName] = useState('');
  const [budget, setBudget] = useState(10000);
  
  // Step 1: Create Campaign
  const renderCreateCampaign = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Create Your First Campaign</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Let's set up your first ad campaign on the Nostr network.
      </p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="campaign-name">
                Campaign Name
              </label>
              <Input 
                id="campaign-name"
                placeholder="Spring Sale 2025"
                className="mt-1"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                A descriptive name to help you identify this campaign
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium" htmlFor="campaign-objective">
                Campaign Objective
              </label>
              <select
                id="campaign-objective"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 mt-1"
              >
                <option value="awareness">Brand Awareness</option>
                <option value="traffic" selected>Website Traffic</option>
                <option value="engagement">Content Engagement</option>
                <option value="conversion">Conversions</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                What's the main goal of your campaign?
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium" htmlFor="campaign-description">
                Description
              </label>
              <Textarea 
                id="campaign-description"
                placeholder="Promote our spring sale with special discounts for Nostr users"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">Create Your First Ad</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="ad-title">
                    Ad Headline
                  </label>
                  <Input 
                    id="ad-title"
                    placeholder="Limited Time: 20% Off All Products"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="ad-description">
                    Ad Description
                  </label>
                  <Textarea 
                    id="ad-description"
                    placeholder="Shop our spring collection with exclusive discounts for Nostr users. Limited time offer!"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="ad-url">
                    Destination URL
                  </label>
                  <Input 
                    id="ad-url"
                    placeholder="https://yourstore.com/spring-sale"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    Ad Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="format-text-image" defaultChecked />
                        <label htmlFor="format-text-image" className="text-sm">Text + Image</label>
                      </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="format-text-only" />
                        <label htmlFor="format-text-only" className="text-sm">Text Only</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    Upload Image (optional)
                  </label>
                  <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
                    <div className="text-sm text-gray-500">
                      Drag and drop an image here, or click to browse
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended size: 1200x628px. Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 2: Set Targeting
  const renderSetTargeting = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Define Your Target Audience</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Reach the right people by specifying targeting criteria.
      </p>
      
      <Tabs defaultValue="interests" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interests" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base font-medium mb-3">Target by Interests</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Select interests that match your target audience.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Bitcoin', 'Lightning Network', 'Nostr', 'Privacy', 'Development', 'Design', 
                  'Finance', 'Gaming', 'Art', 'Music', 'Writing', 'Education', 'NFTs', 
                  'Crypto', 'Web3', 'AI', 'Marketing', 'Entrepreneurship'].map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox id={`interest-${interest}`} />
                    <label 
                      htmlFor={`interest-${interest}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium" htmlFor="custom-interests">
                  Custom Interests
                </label>
                <div className="flex items-center mt-1">
                  <Input 
                    id="custom-interests"
                    placeholder="Enter custom interest"
                    className="flex-1"
                  />
                  <Button className="ml-2">
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add your own custom interests, separated by commas
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Interest Targeting Tips</h3>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Select 3-5 interests for best results. Choosing too many may dilute your targeting effectiveness.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base font-medium mb-3">Target by Location</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Choose geographic regions to target.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Region Selection</label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    multiple
                    size={5}
                  >
                    <option value="global">Global (All Regions)</option>
                    <option value="na">North America</option>
                    <option value="eu">Europe</option>
                    <option value="asia">Asia</option>
                    <option value="sa">South America</option>
                    <option value="af">Africa</option>
                    <option value="au">Australia & Oceania</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Specific Countries</label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="" selected>Select a country...</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="au">Australia</option>
                    <option value="de">Germany</option>
                    <option value="jp">Japan</option>
                    <option value="br">Brazil</option>
                    <option value="other">Other...</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox id="exclude-locations" />
                  <label htmlFor="exclude-locations" className="text-sm">
                    Exclude these locations instead of targeting them
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Location Targeting Notice</h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  Location targeting is approximate and relies on user-provided information. Not all Nostr users share their location.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base font-medium mb-3">Advanced Targeting</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Fine-tune your audience with additional criteria.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Client Types</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="client-all" defaultChecked />
                      <label htmlFor="client-all" className="text-sm">All Nostr Clients</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="client-web" />
                      <label htmlFor="client-web" className="text-sm">Web Clients Only</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="client-mobile" />
                      <label htmlFor="client-mobile" className="text-sm">Mobile Apps Only</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">User Activity</label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all" selected>All Users</option>
                    <option value="active">Active Users (posted in last 7 days)</option>
                    <option value="highly-active">Highly Active Users (posts daily)</option>
                    <option value="new">New Users (joined in last 30 days)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Frequency Capping</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="1"
                        placeholder="3"
                        defaultValue="3"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max impressions per user
                      </p>
                    </div>
                    <div className="flex-1">
                      <select
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="day">Per day</option>
                        <option value="week" selected>Per week</option>
                        <option value="month">Per month</option>
                        <option value="campaign">Per campaign</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Time period
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Step 3: Budget and Schedule
  const renderBudgetSchedule = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Set Budget & Schedule</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Define how much you want to spend and when your campaign will run.
      </p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">Campaign Budget</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Total Budget (in satoshis)</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1000"
                      step="1000"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                    />
                    <div className="text-sm font-medium w-24">
                      ≈ {(budget / 100000000).toFixed(8)} BTC
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <button 
                      className="text-xs text-purple-600 hover:text-purple-800"
                      onClick={() => setBudget(5000)}
                    >
                      5,000 sats
                    </button>
                    <button 
                      className="text-xs text-purple-600 hover:text-purple-800"
                      onClick={() => setBudget(10000)}
                    >
                      10,000 sats
                    </button>
                    <button 
                      className="text-xs text-purple-600 hover:text-purple-800"
                      onClick={() => setBudget(50000)}
                    >
                      50,000 sats
                    </button>
                    <button 
                      className="text-xs text-purple-600 hover:text-purple-800"
                      onClick={() => setBudget(100000)}
                    >
                      100,000 sats
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="daily-budget" />
                  <div>
                    <label htmlFor="daily-budget" className="text-sm font-medium">
                      Set daily budget cap
                    </label>
                    <p className="text-xs text-gray-500">
                      Limits how much can be spent per day
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-refill" />
                  <div>
                    <label htmlFor="auto-refill" className="text-sm font-medium">
                      Enable auto-refill
                    </label>
                    <p className="text-xs text-gray-500">
                      Automatically add funds when budget runs low
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3">Bid Strategy</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Cost Per Click (CPC)</label>
                  <Input
                    type="number"
                    min="10"
                    placeholder="100"
                    defaultValue="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Satoshis paid per click
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Cost Per Impression (CPM)</label>
                  <Input
                    type="number"
                    min="10"
                    placeholder="1000"
                    defaultValue="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Satoshis per 1000 impressions
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium">Estimated Campaign Results</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      With your current budget and bid settings, you can expect approximately:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                      <li>• {Math.floor(budget / 1000)} impressions</li>
                      <li>• {Math.floor(budget / 100)} clicks</li>
                      <li>• Campaign duration: ~7 days (based on average traffic)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3">Campaign Schedule</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Start Date</label>
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">End Date (Optional)</label>
                    <Input
                      type="date"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="run-continuously" defaultChecked />
                  <div>
                    <label htmlFor="run-continuously" className="text-sm font-medium">
                      Run continuously until budget is depleted
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Fund Account
  const renderFundAccount = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fund Your Campaign</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Add funds to your campaign using Bitcoin Lightning Network.
      </p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-base font-medium mb-2">Campaign Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Campaign Name:</span>
                  <span className="font-medium">{campaignName || 'My First Campaign'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Budget:</span>
                  <span className="font-medium">{budget} sats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Est. Impressions:</span>
                  <span className="font-medium">{Math.floor(budget / 1000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Est. Clicks:</span>
                  <span className="font-medium">{Math.floor(budget / 100)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3">Pay with Lightning</h3>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 mb-4 flex items-center justify-center">
                  <p className="text-sm text-gray-500">QR code will appear here</p>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount to pay:</div>
                  <div className="text-2xl font-bold">{budget} sats</div>
                </div>
                
                <div className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-md font-mono text-xs break-all mb-4">
                  lnbc{budget}n1p3a...
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Copy Invoice
                  </Button>
                  <Button size="sm">
                    Open Wallet
                  </Button>
                </div>
              </div>
              
              <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Invoice expires in 15:00 minutes</p>
                <button className="text-purple-600 hover:text-purple-800 mt-1">
                  Need help paying with Lightning?
                </button>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Instant Activation</h3>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Your campaign will be activated instantly upon payment. You can pause or modify it at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 5: Dashboard Introduction
  const renderDashboardIntro = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Campaign Dashboard</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Here's how to monitor and manage your campaigns.
      </p>
      
      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">Campaign Performance Overview</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Impressions</div>
                <div className="text-xl font-bold mt-1">0</div>
                <div className="text-xs text-green-600 mt-1">+0% today</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
                <div className="text-xl font-bold mt-1">0</div>
                <div className="text-xs text-green-600 mt-1">+0% today</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">CTR</div>
                <div className="text-xl font-bold mt-1">0%</div>
                <div className="text-xs text-gray-500 mt-1">Industry avg: 1.2%</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Spent</div>
                <div className="text-xl font-bold mt-1">0 sats</div>
                <div className="text-xs text-gray-500 mt-1">Budget: {budget} sats</div>
              </div>
            </div>
            
            <div className="mt-4 h-32 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-sm text-gray-500">Performance chart will appear here</p>
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <h3 className="text-base font-medium">Key Dashboard Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Real-time Analytics</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Monitor impressions, clicks, and conversions in real-time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Campaign Management</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Edit, pause, or optimize your campaigns at any time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Budget Control</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Manage spending and add funds as needed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Automatic Notifications</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Receive alerts for important campaign events
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Step 6: Complete
  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold">Your Campaign is Live!</h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        Congratulations! Your ad campaign is now running on the Nostr network. You can monitor its performance in your dashboard.
      </p>
      
      <div className="pt-4">
        <div className="text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="font-medium text-purple-800 dark:text-purple-400">Next Steps</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">1.</span>
              Monitor your campaign performance in the dashboard
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">2.</span>
              Create additional ads to test different messaging
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">3.</span>
              Adjust targeting as needed based on results
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">4.</span>
              Add more funds to your campaign when budget runs low
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render the appropriate step
  switch (currentStep) {
    case 'create-campaign':
      return renderCreateCampaign();
    case 'set-targeting':
      return renderSetTargeting();
    case 'budget-schedule':
      return renderBudgetSchedule();
    case 'fund-account':
      return renderFundAccount();
    case 'dashboard-intro':
      return renderDashboardIntro();
    case 'complete':
      return renderComplete();
    default:
      return renderCreateCampaign();
  }
};

export default AdvertiserOnboarding;