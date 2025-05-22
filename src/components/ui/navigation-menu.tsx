import React, { createContext, useContext, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'react-feather'
import { cn } from '../../lib/utils'

const NavigationMenuContext = createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

const useNavigationMenuContext = () => {
  const context = useContext(NavigationMenuContext)
  if (!context) {
    throw new Error('useNavigationMenuContext must be used within a NavigationMenu component')
  }
  return context
}

const NavigationMenu = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const [open, setOpen] = useState(false)

  return (
    <NavigationMenuContext.Provider value={{ open, setOpen }}>
      <nav className={cn("relative z-10", className)} {...props}>
        <div className="flex flex-wrap items-center">
          {children}
        </div>
      </nav>
    </NavigationMenuContext.Provider>
  )
}

const NavigationMenuList = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => {
  return (
    <ul className={cn("flex flex-1 list-none items-center space-x-1", className)} {...props}>
      {children}
    </ul>
  )
}

interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  active?: boolean
}

const NavigationMenuItem = ({
  children,
  className,
  active,
  ...props
}: NavigationMenuItemProps) => {
  return (
    <li className={cn(
      "relative",
      active && "bg-gray-100 dark:bg-gray-800 rounded-md",
      className
    )} {...props}>
      {children}
    </li>
  )
}

const NavigationMenuTrigger = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { open, setOpen } = useNavigationMenuContext()
  
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
        open && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "relative top-px ml-1 h-3 w-3 transition duration-200",
          open && "rotate-180"
        )}
        aria-hidden="true"
      />
    </button>
  )
}

const NavigationMenuContent = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open } = useNavigationMenuContext()
  const ref = useRef<HTMLDivElement>(null)
  
  return (
    <>
      {open && (
        <div
          className={cn(
            "absolute left-0 top-full mt-1 w-full p-2 data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight sm:w-auto",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )}
    </>
  )
}

const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(({ className, active, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      active && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
      className
    )}
    {...props}
  >
    {children}
  </a>
))
NavigationMenuLink.displayName = "NavigationMenuLink"

const NavigationMenuViewport = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open } = useNavigationMenuContext()
  
  return (
    <div
      className={cn(
        "absolute left-0 top-full flex justify-center",
        open ? "animate-in fade-in" : "animate-out fade-out",
        className
      )}
      {...props}
    />
  )
}

const NavigationMenuIndicator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open } = useNavigationMenuContext()
  
  return (
    <div
      className={cn(
        "absolute top-full z-[1] flex h-2.5 items-end justify-center overflow-hidden",
        open ? "animate-in fade-in" : "animate-out fade-out",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-gray-200 shadow-md dark:bg-gray-800" />
    </div>
  )
}

const NextLinkWrapper = ({
  href,
  className,
  children,
  active,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & { active?: boolean }) => (
  <Link 
    href={href} 
    className={cn(
      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      active && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
      className
    )} 
    {...props}
  >
    {children}
  </Link>
)

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NextLinkWrapper as NavigationMenuNextLink
}