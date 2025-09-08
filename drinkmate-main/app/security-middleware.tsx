'use client';

// Client-side security enhancement middleware
import { useEffect } from 'react';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

/**
 * Client-side security middleware component
 * Implements additional security measures on the client side
 */
export default function SecurityMiddleware({ children }: SecurityMiddlewareProps) {
  useEffect(() => {
    // Prevent clickjacking by breaking out of frames
    if (window.self !== window.top && window.top) {
      window.top.location.href = window.self.location.href;
    }

    // Disable browser features that could be security risks
    // Note: These can be set via meta tags as well
    if (navigator.plugins && !Object.getOwnPropertyDescriptor(navigator, 'plugins')?.configurable) {
      try {
        Object.defineProperty(navigator, 'plugins', {
          get: () => [],
          configurable: false
        });
      } catch (error) {
        // Property already defined or not configurable, skip
        console.warn('Could not redefine navigator.plugins:', error);
      }
    }

    // Add runtime protection against XSS
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = (tag: string) => {
      const element = originalCreateElement(tag);
      
      // Add protection for script tags
      if (tag.toLowerCase() === 'script') {
        Object.defineProperty(element, 'src', {
          set(value) {
            // Allow only trusted domains
            const trustedDomains = [
              'googletagmanager.com',
              window.location.hostname
            ];
            
            const url = new URL(value, window.location.href);
            if (trustedDomains.some(domain => url.hostname.includes(domain))) {
              element.setAttribute('src', value);
            } else {
              console.warn('Blocked untrusted script source:', value);
            }
          }
        });
      }
      
      return element;
    };

    // Add event listener to detect XSS payloads in form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      const inputs = form.querySelectorAll('input, textarea');
      
      // Check for obvious XSS patterns
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /data:/gi,
        /on\w+=/gi
      ];
      
      inputs.forEach((input) => {
        const value = (input as HTMLInputElement).value;
        
        if (xssPatterns.some(pattern => pattern.test(value))) {
          e.preventDefault();
          console.error('Potential XSS attack detected in form submission');
          alert('Invalid input detected. Please remove special characters and try again.');
        }
      });
    });

  }, []);

  return <>{children}</>;
}
