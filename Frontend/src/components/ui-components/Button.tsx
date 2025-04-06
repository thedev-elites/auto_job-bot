
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className,
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50";
  
  const variants = {
    primary: "bg-blue text-white hover:bg-blue-dark focus:ring-blue",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    outline: "bg-transparent border border-blue text-blue hover:bg-blue/10 focus:ring-blue",
    ghost: "bg-transparent text-foreground hover:bg-muted focus:ring-muted"
  };
  
  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;
