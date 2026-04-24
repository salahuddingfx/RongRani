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
  isPassword = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFloating = isFocused || value?.length > 0;

  return (
    <div className="relative mb-6 group">
      {/* Icon */}
      {Icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 z-10 
          ${isFloating ? 'text-maroon' : 'text-slate-400'}`}>
          <Icon size={20} strokeWidth={isFloating ? 2.5 : 2} />
        </div>
      )}

      {/* Label */}
      <label
        className={`absolute transition-all duration-300 pointer-events-none z-20 px-1
          ${Icon ? 'left-12' : 'left-4'}
          ${isFloating 
            ? `-top-2.5 text-xs font-bold text-maroon bg-white scale-95` 
            : `top-1/2 -translate-y-1/2 text-sm text-slate-400`}`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Input */}
      <input
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className={`w-full px-4 ${Icon ? 'pl-12' : ''} ${isPassword ? 'pr-12' : ''} py-3.5 
          bg-white border-2 rounded-2xl outline-none transition-all duration-300 text-sm font-medium
          ${isFloating 
            ? 'border-maroon shadow-premium ring-4 ring-maroon/5' 
            : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
      />

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
