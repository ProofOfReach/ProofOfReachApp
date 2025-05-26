import { UserRole } from "@/types/role";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronDown, X, Menu } from 'react-feather';

// Import shadcn/ui components
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetClose } from '../ui/sheet';
import { NavigationMenu } from '../ui/navigation-menu';
import { Button } from '@/components/ui/Button';
import NavGroup from '../ui/nav-group';
import Icon from '../ui/icon';

// Import navigation utilities
import '@/lib/navigationBuilder';

/**
 * Simplified Enhanced Sidebar component built with shadcn/ui styled components
 * This version uses our navigation builder utility for role-based navigation
 */
const SimplifiedEnhancedSidebar: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Default role used for demo purposes
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Get active menu item styling
  const getActiveClass = (href: UserRole, active?: boolean): string => {
    const isActive = active || router.pathname === href || router.pathname.startsWith(`${href}/`);
    
    if (isActive) {
      return 'bg-gray-100 text-purple-700 dark:bg-gray-800 dark:text-purple-300';
    } else {
      return '';
    }
  };

  // Simple role change handler for demo
  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    setRoleDropdownOpen(false);
  };
  
  // Get filtered role options (all roles except current one)
  const getFilteredRoleOptions = (): string[] => {
    return (['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[])
      .filter(roleOption => roleOption !== currentRole);
  };
  
  // Build navigation items based on current role and path
  const navSections = buildNavigation(currentRole, router.pathname);
  
  // Get role icon and styling
  const roleStyle = getRoleIconAndColor(currentRole);
  
  // Logout handler - for the demo just show alert
  const handleLogout = () => {
    alert('Logout clicked');
  };
  
  // Create logout item
  const logoutItem = createLogoutItem(handleLogout);

  // Mobile sidebar content - shared between mobile and desktop
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">Nostr Ad Market</h1>
      </div>
      
      {/* Role selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="outline"
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm",
              roleStyle.bgColor,
              roleStyle.textColor
            )}
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            data-testid={`role-selector-${currentRole}`}
          >
            <div className="flex items-center">
              <span className="mr-3">
                <Icon name={roleStyle.iconName} size={20} className={roleStyle.textColor} />
              </span>
              <span>{roleStyle.label}</span>
            </div>
            <ChevronDown 
              className={cn(
                "h-4 w-4 ml-2 transition-transform",
                roleDropdownOpen && "rotate-180"
              )}
            />
          </Button>
          
          {/* Dropdown menu */}
          <div 
            className={cn(
              "absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity duration-100",
              roleDropdownOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            data-testid="role-dropdown"
          >
            {getFilteredRoleOptions().map((roleOption) => {
              const optionStyle = getRoleIconAndColor(roleOption);
              return (
                <Button
                  key={roleOption}
                  variant="ghost"
                  onClick={() => handleRoleChange(roleOption)}
                  className="w-full flex items-center justify-start px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
                  data-testid={`role-option-${roleOption}`}
                >
                  <span className="mr-3">
                    <Icon name={optionStyle.iconName} size={20} className={optionStyle.textColor} />
                  </span>
                  <span>{optionStyle.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Menu navigation */}
      <NavigationMenu className="flex-grow overflow-y-auto py-4 px-3">
        <div className="w-full">
          {/* Render each nav section */}
          {navSections.map((section) => (
            <NavGroup
              key={section.title}
              title={section.title}
              items={section.items}
              className="mb-6"
              getActiveClass={getActiveClass}
            />
          ))}
          
          {/* Logout button */}
          <div className="mt-6">
            <Button
              variant="ghost"
              className="flex items-center w-full px-2 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <span className="mr-3 flex-shrink-0">
                <Icon name="logout" size={20} className="text-gray-500" />
              </span>
              <span className="truncate">Logout</span>
            </Button>
          </div>
        </div>
      </NavigationMenu>
      
      {/* Footer section */}
      <div className="pt-4 px-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example Navigation
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      <Button 
        variant="default"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed z-50 bottom-4 right-4 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
        data-testid="mobile-menu-button"
      >
        <Menu className="w-5 h-5" />
      </Button>
      
      {/* Mobile sidebar using Sheet component */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 max-w-[80vw]" data-testid="mobile-sidebar">
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
          <SidebarContent />
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <aside className="hidden md:block sticky top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" data-testid="desktop-sidebar">
        <SidebarContent />
      </aside>
    </>
  );
};

export default SimplifiedEnhancedSidebar;