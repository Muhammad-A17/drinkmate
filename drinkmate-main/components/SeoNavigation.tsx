'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatSeoUrl, generateBreadcrumbs } from '@/lib/utils/seo-utils';

interface SeoLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  target?: '_blank' | '_self';
  rel?: string;
  onClick?: () => void;
}

/**
 * SEO-friendly link component with proper attributes
 */
export function SeoLink({
  href,
  children,
  className = '',
  title,
  ariaLabel,
  target = '_self',
  rel = target === '_blank' ? 'noopener noreferrer' : undefined,
  onClick,
}: SeoLinkProps) {
  // Format the URL for SEO
  const formattedHref = formatSeoUrl(href);
  
  // Generate a title if not provided
  const linkTitle = title || (typeof children === 'string' ? children : undefined);
  
  return (
    <Link
      href={formattedHref}
      className={className}
      title={linkTitle}
      aria-label={ariaLabel || linkTitle}
      target={target}
      rel={rel}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

interface SeoExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

/**
 * SEO-friendly external link component with proper security attributes
 */
export function SeoExternalLink({
  href,
  children,
  className = '',
  title,
  ariaLabel,
  onClick,
}: SeoExternalLinkProps) {
  // Generate a title if not provided
  const linkTitle = title || (typeof children === 'string' ? children : undefined);
  
  return (
    <a
      href={href}
      className={className}
      title={linkTitle}
      aria-label={ariaLabel || linkTitle}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {children}
    </a>
  );
}

interface BreadcrumbsProps {
  className?: string;
  homeText?: string;
  separator?: React.ReactNode;
  customItems?: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * SEO-friendly breadcrumbs navigation with structured data
 */
export function Breadcrumbs({
  className = '',
  homeText = 'Home',
  separator = <ChevronRight className="h-4 w-4 mx-1" />,
  customItems,
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const [baseUrl, setBaseUrl] = useState('');
  
  // Get the base URL on the client side
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);
  
  // Generate breadcrumb items from the pathname
  const getBreadcrumbItems = () => {
    if (customItems) return customItems;
    
    const pathSegments = pathname
      .split('/')
      .filter(Boolean);
      
    // Start with home
    const items = [{ name: homeText, url: '/' }];
    
    // Add each path segment
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      // Convert kebab-case to Title Case
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      items.push({ name, url: currentPath });
    });
    
    return items;
  };
  
  const breadcrumbItems = getBreadcrumbItems();
  
  // Generate structured data for breadcrumbs
  const breadcrumbStructuredData = baseUrl ? generateBreadcrumbs(breadcrumbItems, baseUrl) : null;
  
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="flex items-center">{separator}</span>}
              {index === breadcrumbItems.length - 1 ? (
                <span className="font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <SeoLink href={item.url} className="hover:underline">
                  {item.name}
                </SeoLink>
              )}
            </li>
          ))}
        </ol>
      </nav>
      
      {baseUrl && breadcrumbStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />
      )}
    </>
  );
}

export default {
  SeoLink,
  SeoExternalLink,
  Breadcrumbs,
};
