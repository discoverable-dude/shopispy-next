"use client";

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Play } from 'lucide-react';

interface GuidedTourProps {
  autoStart?: boolean;
  onComplete?: () => void;
}

export const GuidedTour = ({ autoStart = false, onComplete }: GuidedTourProps) => {
  const [showTourPrompt, setShowTourPrompt] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('shopispy-tour-completed');
    if (!hasSeenTour && autoStart) {
      setShowTourPrompt(true);
    }
  }, [autoStart]);

  const startTour = () => {
    setShowTourPrompt(false);

    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: '[data-tour="quick-scraper"]',
          popover: {
            title: 'Quick Scraper',
            description: 'Start here! Enter any Shopify store URL to scrape product data instantly.',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '[data-tour="search-filter"]',
          popover: {
            title: 'Search & Filter',
            description: 'Use the search bar and filters to find specific products and competitors.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-tour="export-data"]',
          popover: {
            title: 'Export Results',
            description: 'Download your competitor data in CSV, XLSX, or JSON format.',
            side: "top",
            align: 'start'
          }
        },
        {
          element: '[data-tour="alerts-setup"]',
          popover: {
            title: 'Set Up Alerts',
            description: 'Get notified when competitors add new products or change prices.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-tour="usage-counter"]',
          popover: {
            title: 'Track Usage',
            description: 'Monitor your scraping limits and upgrade when needed.',
            side: "bottom",
            align: 'start'
          }
        }
      ],
      onDestroyStarted: () => {
        localStorage.setItem('shopispy-tour-completed', 'true');
        onComplete?.();
      },
    });

    driverObj.drive();
  };

  const skipTour = () => {
    setShowTourPrompt(false);
    localStorage.setItem('shopispy-tour-completed', 'true');
    onComplete?.();
  };

  if (!showTourPrompt) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Welcome to ShopiSpy!
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Would you like a quick tour of the main features?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We'll show you how to scrape competitor data, set up alerts, and export results.
          </p>
          <div className="flex gap-2">
            <Button onClick={startTour} className="flex-1">
              Start Tour
            </Button>
            <Button variant="outline" onClick={skipTour} className="flex-1">
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
