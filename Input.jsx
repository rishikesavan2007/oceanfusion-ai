import React, { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  className,
  icon: Icon,
  placeholder,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Float label logic if required, but modern standard is often top-label with clean borders.
  // We'll use a clean top label with a subtle focus ring.
  const baseInputClasses = "block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg text-text-main dark:text-text-light shadow-sm focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 sm:text-sm";
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-main dark:text-text-light mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-text-muted" />
          </div>
        )}
        <input
          id={id}
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={twMerge(
            clsx(
              baseInputClasses,
              Icon ? 'pl-10' : 'pl-3',
              isPassword ? 'pr-10' : 'pr-3',
              error && 'border-danger focus:border-danger focus:ring-danger',
              'py-2.5',
              className
            )
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
