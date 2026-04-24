import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FloatingInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  icon: Icon,
  isPassword = false,
  isTextArea = false,
  rows = 4
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFloating = isFocused || value?.length > 0;

  const inputClasses = `w-full px-4 ${Icon ? 'pl-12' : ''} ${isPassword ? 'pr-12' : ''} py-3.5 
    bg-white dark:bg-slate-900 border-2 rounded-2xl outline-none transition-all duration-300 text-sm font-medium
    dark:text-white
    ${isFloating 
      ? 'border-maroon shadow-premium ring-4 ring-maroon/5 dark:border-maroon' 
      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}`;

  const labelClasses = `absolute transition-all duration-300 pointer-events-none z-20 px-1
    ${Icon ? 'left-12' : 'left-4'}
    ${isFloating 
      ? `-top-2.5 text-xs font-bold text-maroon bg-white dark:bg-slate-900 scale-95` 
      : `top-1/2 -translate-y-1/2 text-sm text-slate-400`}`;

  return (
    <div className={`relative mb-6 group ${isTextArea ? 'pt-2' : ''}`}>
      {/* Icon */}
      {Icon && (
        <div className={`absolute left-4 ${isTextArea ? 'top-8' : 'top-1/2 -translate-y-1/2'} transition-all duration-300 z-10 
          ${isFloating ? 'text-maroon' : 'text-slate-400'}`}>
          <Icon size={20} strokeWidth={isFloating ? 2.5 : 2} />
        </div>
      )}

      {/* Label */}
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Input or TextArea */}
      {isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          rows={rows}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={inputClasses}
        />
      )}

      {/* Password Toggle */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-maroon transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}

      {/* Bottom Focus Line */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-maroon transition-all duration-500 rounded-full
        ${isFocused ? 'w-[90%]' : 'w-0'}`}></div>
    </div>
  );
};

export default FloatingInput;
