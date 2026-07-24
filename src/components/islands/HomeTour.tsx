import React, { useEffect } from 'react';
import { driver } from 'driver.js';

interface HomeTourProps {
  isLoggedIn?: boolean;
}

export default function HomeTour({ isLoggedIn = false }: HomeTourProps) {
  useEffect(() => {
    // Check if tour was already completed/dismissed
    const hasSeenTour = localStorage.getItem('carcblog_tour_home_seen');
    if (hasSeenTour === 'true') return;

    // Small delay (1000ms) to ensure page layout settles
    const timer = setTimeout(() => {
      // Find element targets safely
      const feedTarget = document.querySelector('a[href="/feed"]') || '.nav-links';
      const searchTarget = document.querySelector('#search-trigger') || '#search-wrap';
      const writeTarget = document.querySelector('#nav-write-cta') || document.querySelector('#hero-join-cta') || '.hero-cta-row';
      const authTarget = document.querySelector('#nav-get-started-cta') || document.querySelector('.user-btn-wrap') || '.nav-actions';

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: 'Got it!',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        onDestroyed: () => {
          localStorage.setItem('carcblog_tour_home_seen', 'true');
        },
        steps: [
          {
            element: feedTarget as HTMLElement,
            popover: {
              title: 'Browse Stories',
              description: 'Browse the latest stories, news, and insights from our writers.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: searchTarget as HTMLElement,
            popover: {
              title: 'Instant Search',
              description: 'Search articles, topics, and authors across the publication.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: writeTarget as HTMLElement,
            popover: {
              title: 'Share Your Story',
              description: 'Have a story or startup update to share? Start writing here.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: authTarget as HTMLElement,
            popover: {
              title: isLoggedIn ? 'Your Account' : 'Join the Community',
              description: isLoggedIn
                ? 'Access your profile settings, saved drafts, and writer dashboard.'
                : 'Sign up to follow writers, save articles, and start publishing.',
              side: 'bottom',
              align: 'end'
            }
          }
        ]
      });

      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  return null; // Non-visual island component
}
