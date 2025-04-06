
import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          className={cn(
            "input-field w-full",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
