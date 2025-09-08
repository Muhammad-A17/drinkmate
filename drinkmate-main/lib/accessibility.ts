// Accessibility utilities

export function announceToScreenReader(message: string) {
  if (typeof window !== 'undefined') {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
}

export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusableElement = focusableElements[0] as HTMLElement
  const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus()
          e.preventDefault()
        }
      }
    }
  })
}

export function addSkipLink() {
  if (typeof window !== 'undefined') {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50'
    document.body.insertBefore(skipLink, document.body.firstChild)
  }
}

export function improveFormAccessibility() {
  if (typeof window !== 'undefined') {
    // Add proper labels to form inputs
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    inputs.forEach(input => {
      const id = input.getAttribute('id')
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (!label) {
          console.warn(`Input with id "${id}" is missing a label`)
        }
      }
    })
    
    // Add error announcements
    const errorElements = document.querySelectorAll('[role="alert"]')
    errorElements.forEach(error => {
      error.setAttribute('aria-live', 'assertive')
    })
  }
}

export function enhanceKeyboardNavigation() {
  if (typeof window !== 'undefined') {
    // Add keyboard navigation for custom components
    const customButtons = document.querySelectorAll('[role="button"]:not(button)')
    customButtons.forEach(button => {
      button.addEventListener('keydown', (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          e.preventDefault();
          (button as HTMLElement).click();
        }
      });
    });
    
    // Add arrow key navigation for menus
    const menus = document.querySelectorAll('[role="menu"]')
    menus.forEach(menu => {
      const items = Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
      let currentIndex = 0;
      
      menu.addEventListener('keydown', (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        switch (keyEvent.key) {
          case 'ArrowDown':
            e.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            currentIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            items[currentIndex].focus();
            break;
          case 'Home':
            e.preventDefault();
            currentIndex = 0;
            items[currentIndex].focus();
            break;
          case 'End':
            e.preventDefault();
            currentIndex = items.length - 1;
            items[currentIndex].focus();
            break;
        }
      });
    });
  }
}

export function addFocusIndicators() {
  if (typeof window !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = `
      *:focus {
        outline: 2px solid #12d6fa !important;
        outline-offset: 2px !important;
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: 0.5rem 1rem;
        margin: 0;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `
    document.head.appendChild(style)
  }
}

export function improveColorContrast() {
  if (typeof window !== 'undefined') {
    // Check and improve color contrast
    const elements = document.querySelectorAll('*')
    elements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      
      // Basic contrast check (simplified)
      if (color && backgroundColor && color !== backgroundColor) {
        // Add high contrast mode support
        if (window.matchMedia('(prefers-contrast: high)').matches) {
          element.classList.add('high-contrast')
        }
      }
    })
  }
}

export function addReducedMotionSupport() {
  if (typeof window !== 'undefined') {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style')
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `
      document.head.appendChild(style)
    }
  }
}

export function initializeAccessibility() {
  if (typeof window !== 'undefined') {
    addSkipLink()
    improveFormAccessibility()
    enhanceKeyboardNavigation()
    addFocusIndicators()
    improveColorContrast()
    addReducedMotionSupport()
  }
}
