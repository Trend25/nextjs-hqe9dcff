'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

interface StartupSubmission {
  company_name: string;
  founded_year: number;
  industry: string;
  description?: string;
  team_size: number;
  founders_count: number;
  key_hires: number;
  monthly_revenue: number;
  total_funding: number;
  burn_rate: number;
  runway?: number;
  has_live_product: boolean;
  active_customers: number;
  monthly_growth_rate: number;
  customer_acquisition_cost: number;
  lifetime_value: number;
  has_paid_customers: boolean;
  has_recurring_revenue: boolean;
  is_operationally_profitable: boolean;
  has_scalable_business_model: boolean;
  market_size: number;
  target_market?: string;
  is_draft: boolean;
  user_id?: string;
}

const FORM_STEPS = [
  {
    id: 1,
    title: 'Company Information',
    description: 'Basic information about your startup',
  },
  {
    id: 2,
    title: 'Team & Organization',
    description: 'Team size and organizational details',
  },
  {
    id: 3,
    title: 'Financial Metrics',
    description: 'Revenue, funding, and financial data',
  },
  {
    id: 4,
    title: 'Product & Market',
    description: 'Product development and market information',
  },
  {
    id: 5,
    title: 'Business Model',
    description: 'Revenue model and business operations',
  },
];

const INDUSTRIES = [
  'Technology/Software',
  'E-commerce',
  'Healthcare/Biotech',
  'Fintech',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Media/Entertainment',
  'Food & Beverage',
  'Transportation',
  'Energy',
  'Other',
];

// Helper function to calculate runway
function calculateRunway(totalFunding: number, monthlyRevenue: number, burnRate: number): string {
  if (burnRate === 0) {
    return 'Unlimited (no burn)';
  }
  
  const netBurn = burnRate - monthlyRevenue;
  
  if (netBurn <= 0) {
    return 'Unlimited (profitable)';
  }
  
  const runwayMonths = Math.floor(totalFunding / netBurn);
  
  if (runwayMonths < 0) {
    return 'No funding available';
  }
  
  if (runwayMonths === 0) {
    return 'Less than 1 month ⚠️';
  }
  
  if (runwayMonths === 1) {
    return '1 month ⚠️';
  }
  
  if (runwayMonths < 6) {
    return `${runwayMonths} months ⚠️`;
  }
  
  return `${runwayMonths} months`;
}

export default function StartupSubmissionForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState<StartupSubmission>({
    company_name: '',
    founded_year: new Date().getFullYear(),
    industry: '',
    description: '',
    team_size: 1,
    founders_count: 1,
    key_hires: 0,
    monthly_revenue: 0,
    total_funding: 0,
    burn_rate: 0,
    runway: 0,
    has_live_product: false,
    active_customers: 0,
    monthly_growth_rate: 0,
    customer_acquisition_cost: 0,
    lifetime_value: 0,
    has_paid_customers: false,
    has_recurring_revenue: false,
    is_operationally_profitable: false,
    has_scalable_business_model: false,
    market_size: 0,
    target_market: '',
    is_draft: true,
  });

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const updateFormData = (updates: Partial<StartupSubmission>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.company_name && formData.industry);
      case 2:
        return !!(formData.team_size >= 1 && formData.founders_count >= 1);
      case 3:
        return true; // Financial data is optional in early stages
      case 4:
        return true; // Product data is optional
      case 5:
        return true; // Business model data is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length));
      setError('');
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const saveDraft = async () => {
    if (!user) {
      setError('You must be logged in to save a draft');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const submissionData = {
        ...formData,
        user_id: user.id,
        is_draft: true,
        updated_at: new Date().toISOString(),
      };

      const { error: saveError } = await supabase
        .from('startup_submissions')
        .upsert([submissionData]);

      if (saveError) throw saveError;

      setSuccess('Draft saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Failed to save draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitForm = async () => {
    if (!user) {
      setError('You must be logged in to submit');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Final validation
      if (!formData.company_name || !formData.industry) {
        setError('Please complete at least the company information before submitting.');
        setIsLoading(false);
        return;
      }

      const submissionData = {
        ...formData,
        user_id: user.id,
        is_draft: false,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Submitting data:', submissionData);

      const { data, error: submitError } = await supabase
        .from('startup_submissions')
        .insert([submissionData])
        .select()
        .single();

      if (submitError) {
        console.error('Supabase error:', submitError);
        throw submitError;
      }

      console.log('Submission successful:', data);
      
      // Show success message before redirect
      setSuccess('Submission successful! Redirecting...');
      
      // Delay redirect slightly to show success message
      setTimeout(() => {
        router.push(`/dashboard/analyses${data?.id ? `?new_submission=${data.id}` : ''}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error submitting form:', err);
      const errorMessage = err.message || 'Failed to submit form. Please try again.';
      setError(errorMessage);
      
      // Keep error visible
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => updateFormData({ company_name: e.target.value })}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input
                id="founded_year"
                type="number"
                value={formData.founded_year || ''}
                onChange={(e) => updateFormData({ founded_year: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <select
                id="industry"
                value={formData.industry || ''}
                onChange={(e) => updateFormData({ industry: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Brief description of what your company does..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="team_size">Total Team Size *</Label>
              <Input
                id="team_size"
                type="number"
                value={formData.team_size}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  updateFormData({ team_size: isNaN(value) ? 1 : Math.max(1, value) });
                }}
                placeholder="5"
                min="1"
              />
              <p className="text-sm text-gray-500">Include all employees, contractors, and founders</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="founders_count">Number of Founders *</Label>
              <Input
                id="founders_count"
                type="number"
                value={formData.founders_count}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  updateFormData({ founders_count: isNaN(value) ? 1 : Math.max(1, value) });
                }}
                placeholder="2"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_hires">Key Hires (C-level, VPs)</Label>
              <Input
                id="key_hires"
                type="number"
                value={formData.key_hires}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  updateFormData({ key_hires: isNaN(value) ? 0 : Math.max(0, value) });
                }}
                placeholder="0"
                min="0"
              />
              <p className="text-sm text-gray-500">
                Non-founder executives and senior leadership (Enter 0 if none)
              </p>
            </div>
          </div>
        );

      case 3:
        const runway = calculateRunway(
          formData.total_funding || 0,
          formData.monthly_revenue || 0,
          formData.burn_rate || 0
        );
        
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="monthly_revenue">Monthly Revenue (USD)</Label>
              <Input
                id="monthly_revenue"
                type="number"
                value={formData.monthly_revenue || ''}
                onChange={(e) => updateFormData({ monthly_revenue: parseInt(e.target.value) || 0 })}
                placeholder="10000"
                min="0"
              />
              <p className="text-sm text-gray-500">Average monthly recurring revenue</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_funding">Total Funding Available (USD)</Label>
              <Input
                id="total_funding"
                type="number"
                value={formData.total_funding || ''}
                onChange={(e) => updateFormData({ total_funding: parseInt(e.target.value) || 0 })}
                placeholder="100000"
                min="0"
              />
              <p className="text-sm text-gray-500">Current bank balance / available capital</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="burn_rate">Monthly Burn Rate (USD)</Label>
              <Input
                id="burn_rate"
                type="number"
                value={formData.burn_rate || ''}
                onChange={(e) => updateFormData({ burn_rate: parseInt(e.target.value) || 0 })}
                placeholder="5000"
                min="0"
              />
              <p className="text-sm text-gray-500">Total monthly expenses (salaries, rent, etc.)</p>
            </div>

            {formData.burn_rate > 0 && (
              <div className={`p-4 rounded-lg ${
                runway.includes('⚠️') ? 'bg-red-50 border border-red-200' : 'bg-blue-50'
              }`}>
                <p className={`text-sm font-semibold ${
                  runway.includes('⚠️') ? 'text-red-700' : 'text-blue-700'
                }`}>
                  <strong>Estimated Runway:</strong> {runway}
                </p>
                {runway.includes('Less than') && (
                  <p className="text-xs text-red-600 mt-1">
                    Critical: Immediate funding needed to continue operations
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Product Status</Label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="has_live_product"
                  checked={formData.has_live_product || false}
                  onChange={(e) => updateFormData({ has_live_product: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="has_live_product" className="text-sm">
                  We have a live product/service
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="active_customers">Active Customers</Label>
              <Input
                id="active_customers"
                type="number"
                value={formData.active_customers || ''}
                onChange={(e) => updateFormData({ active_customers: parseInt(e.target.value) || 0 })}
                placeholder="100"
                min="0"
              />
              <p className="text-sm text-gray-500">Current active users or customers</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_growth_rate">Monthly Growth Rate (%)</Label>
              <Input
                id="monthly_growth_rate"
                type="number"
                value={formData.monthly_growth_rate || ''}
                onChange={(e) => updateFormData({ monthly_growth_rate: parseFloat(e.target.value) || 0 })}
                placeholder="10"
                min="0"
                step="0.1"
              />
              <p className="text-sm text-gray-500">Month-over-month customer or revenue growth</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_acquisition_cost">Customer Acquisition Cost (USD)</Label>
                <Input
                  id="customer_acquisition_cost"
                  type="number"
                  value={formData.customer_acquisition_cost || ''}
                  onChange={(e) => updateFormData({ customer_acquisition_cost: parseInt(e.target.value) || 0 })}
                  placeholder="50"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifetime_value">Customer Lifetime Value (USD)</Label>
                <Input
                  id="lifetime_value"
                  type="number"
                  value={formData.lifetime_value || ''}
                  onChange={(e) => updateFormData({ lifetime_value: parseInt(e.target.value) || 0 })}
                  placeholder="500"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_market">Target Market</Label>
              <Input
                id="target_market"
                value={formData.target_market || ''}
                onChange={(e) => updateFormData({ target_market: e.target.value })}
                placeholder="Small businesses, B2B SaaS, Consumer mobile apps..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="market_size">Total Addressable Market (USD)</Label>
              <Input
                id="market_size"
                type="number"
                value={formData.market_size || ''}
                onChange={(e) => updateFormData({ market_size: parseInt(e.target.value) || 0 })}
                placeholder="10000000"
                min="0"
              />
              <p className="text-sm text-gray-500">Estimated total market size for your product</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Business Model Characteristics</Label>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="has_paid_customers"
                    checked={formData.has_paid_customers || false}
                    onChange={(e) => updateFormData({ has_paid_customers: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="has_paid_customers" className="text-sm">
                    We have paying customers
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="has_recurring_revenue"
                    checked={formData.has_recurring_revenue || false}
                    onChange={(e) => updateFormData({ has_recurring_revenue: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="has_recurring_revenue" className="text-sm">
                    We have recurring revenue (subscriptions, contracts)
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_operationally_profitable"
                    checked={formData.is_operationally_profitable || false}
                    onChange={(e) => updateFormData({ is_operationally_profitable: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_operationally_profitable" className="text-sm">
                    We are operationally profitable (revenue exceeds costs)
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="has_scalable_business_model"
                    checked={formData.has_scalable_business_model || false}
                    onChange={(e) => updateFormData({ has_scalable_business_model: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="has_scalable_business_model" className="text-sm">
                    Our business model is highly scalable
                  </label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Company:</strong> {formData.company_name || 'Not specified'}</p>
                  <p><strong>Industry:</strong> {formData.industry || 'Not specified'}</p>
                  <p><strong>Team Size:</strong> {formData.team_size} people</p>
                </div>
                <div>
                  <p><strong>Monthly Revenue:</strong> ${formData.monthly_revenue?.toLocaleString() || '0'}</p>
                  <p><strong>Total Funding:</strong> ${formData.total_funding?.toLocaleString() || '0'}</p>
                  <p><strong>Active Customers:</strong> {formData.active_customers?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step.id === currentStep
                  ? 'bg-blue-600 text-white'
                  : step.id < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (FORM_STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{FORM_STEPS[currentStep - 1]?.title}</CardTitle>
          <CardDescription>{FORM_STEPS[currentStep - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
          >
            Previous
          </Button>

          <Button
            variant="ghost"
            onClick={saveDraft}
            disabled={isLoading}
          >
            {isLoading && !success ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>

        <div className="flex space-x-3">
          {currentStep < FORM_STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={isLoading || !validateStep(currentStep)}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={submitForm}
              disabled={isLoading || !formData.company_name || !formData.industry}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading && !success ? 'Submitting...' : 'Submit for Analysis 🚀'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
