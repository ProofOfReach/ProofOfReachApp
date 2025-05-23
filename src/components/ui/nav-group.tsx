import React from 'react';
import { NavigationMenuList, NavigationMenuItem, NavigationMenuNextLink } from './navigation-menu';
import '@/lib/utils';
import Icon from './icon';
import '@/lib/navigationBuilder';

/**
 * Interface for a navigation item
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  iconName?: IconName;
  active?: boolean;
}

/**
 * Interface for NavGroup component props
 */
interface NavGroupProps {
  title?: string;
  items: NavItem[];
  className?: string;
  getActiveClass?: (href: UserRole, active?: boolean) => string;
}

/**
 * NavGroup component for grouping navigation items with an optional title
 * Used to create sections in navigation menus
 */
const NavGroup: React.FC<NavGroupProps> = ({
  title,
  items,
  className,
  getActiveClass = (href, active) => active ? 'bg-gray-100 text-purple-700 dark:bg-gray-800 dark:text-purple-300' : ''
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)} data-testid={`nav-group-${title?.toLowerCase().replace(/\s+/g, '-')}`}>
      {title && (
        <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold px-2">
          {title}
        </h2>
      )}
      <NavigationMenuList className="flex-col space-y-1 space-x-0 w-full min-w-0">
        {items.map((item) => (
          <NavigationMenuItem key={item.label} active={item.active}>
            <NavigationMenuNextLink 
              href={item.href}
              className={cn(
                "flex items-center w-full px-2 py-2 text-sm rounded-md",
                "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                getActiveClass(item.href, item.active)
              )}
              data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* Display icon based on either iconName or direct icon prop */}
              {item.iconName ? (
                <span className="mr-3 flex-shrink-0">
                  <Icon name={item.iconName} size={20} className={item.active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'} />
                </span>
              ) : item.icon ? (
                <span className="mr-3 flex-shrink-0">{item.icon}</span>
              ) : null}
              <span className="truncate">{item.label}</span>
            </NavigationMenuNextLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </div>
  );
};

export default NavGroup;