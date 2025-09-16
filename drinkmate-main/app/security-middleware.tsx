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
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Prevent clickjacking by breaking out of frames
    if (window.self !== window.top && window.top) {
      window.top.location.href = window.self.location.href;
    }

    // Add event listener to detect XSS payloads in form submissions
    const handleSubmit = (e: Event) => {
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
    };

    document.addEventListener('submit', handleSubmit);
    
    // Cleanup function
    return () => {
      document.removeEventListener('submit', handleSubmit);
    };
  }, []);

  return <>{children}</>;
}
