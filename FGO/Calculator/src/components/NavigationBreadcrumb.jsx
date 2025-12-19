import React from 'react';
import Icon from './AppIcon';

const NavigationBreadcrumb = () => {
  // Hardcode the current page since we're not using routing
  const currentPage = 'Calculator';
  
  return (
    <nav 
      className="bg-muted/30 border-b border-border py-2 px-4 md:px-6"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <button
            onClick={() => console.log('Navigate to previous page')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150"
            aria-label="Go back"
          >
            <Icon name="ChevronLeft" size={16} />
            <span className="hidden sm:inline">Back</span>
            <span className="sm:hidden">
              <Icon name="ArrowLeft" size={16} />
            </span>
          </button>
        </li>
        <li>
          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
        </li>
        <li>
          <span className="text-foreground font-medium">{currentPage}</span>
        </li>
      </ol>
    </nav>
  );
};

export default NavigationBreadcrumb;