import React, { useEffect } from 'react';
import { driver } from 'driver.js';

export default function DashboardTour() {
  useEffect(() => {
    // Check if dashboard tour was already completed/dismissed
    const hasSeenTour = localStorage.getItem('carcblog_tour_dashboard_seen');
    if (hasSeenTour === 'true') return;

    // Small delay (1000ms) to ensure page layout settles
    const timer = setTimeout(() => {
      const writeTarget = document.querySelector('#dash-new-article') || document.querySelector('#dash-new-article-btn') || '.welcome-block';
      const articlesNavTarget = document.querySelector('a[href="/dashboard/articles"]') || document.querySelector('#dash-all-articles');
      const statsTarget = document.querySelector('.stats-grid') || '.welcome-block';
      const profileNavTarget = document.querySelector('a[href="/dashboard/profile"]') || document.querySelector('a[href="/dashboard/settings"]');

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: 'Start Writing',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        onDestroyed: () => {
          localStorage.setItem('carcblog_tour_dashboard_seen', 'true');
        },
        steps: [
          {
            element: writeTarget as HTMLElement,
            popover: {
              title: 'Write a New Story',
              description: 'Launch the WYSIWYG editor featuring live AI co-writer assistance and Pexels stock media search.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: articlesNavTarget as HTMLElement,
            popover: {
              title: 'Manage Your Articles',
              description: 'View all your draft stories, published articles, scheduled release dates, or edit existing posts.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: statsTarget as HTMLElement,
            popover: {
              title: 'Performance Analytics',
              description: 'Track your publication story counts, total audience views, and average reading time.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: profileNavTarget as HTMLElement,
            popover: {
              title: 'Profile & AI Key Settings',
              description: 'Update your author bio, avatar, and securely configure your private Gemini or OpenRouter AI keys.',
              side: 'right',
              align: 'end'
            }
          }
        ]
      });

      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // Non-visual island component
}
