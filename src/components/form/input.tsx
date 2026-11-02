import { useState } from "react";
import { EyeIcon, EyeClosedIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import lodash from 'lodash';

interface TextInputProps {
  id: string,
  label?: string;
  placeholder?: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password" | "number" | "date" | "datetime-local";
  disabled?: boolean;
  icon?: "search" | "none";
  handleBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  values?: any;
  errors?: any;
  touched?: any;
  preText?: string;
  postText?: string;
  step?: number,
  min?: number | string,
  max?: number | string,
  hideError?: boolean;
  required?: boolean;
  className?: string;
}

export default function TextInput({
  id,
  label,
  placeholder = "",
  handleChange,
  type = "text",
  disabled = false,
  values,
  errors,
  touched,
  icon = "none",
  handleBlur,
  handleFocus,
  preText,
  postText,
  step,
  min,
  max,
  hideError = false,
  required,
  className,
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const inputError = lodash.get(errors, id) &&  lodash.get(touched, id) 
    ? lodash.get(errors, id)
    : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          {label} {required && (<span className="text-red-500">*</span>)}
        </label>
      )}
      <div
        className={`flex items-center border shadow-sm px-3 rounded
          ${inputError ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          ${className || ""}
        `}
      >
        {/* Left Icon */}
        {icon === "search" && (
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2" />
        )}
        {/* Pretext */}
        {preText && (
          <span className="mr-2 text-gray-500 text-sm whitespace-nowrap">
            {preText}
          </span>
        )}

        {/* Input */}
        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          value={lodash.get(values, id)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          className="flex-1 py-2 bg-transparent outline-none text-sm text-gray-900"
        />
        
        {/* Postext */}
        {postText && (
          <span className="ml-2 text-gray-500 text-sm whitespace-nowrap">
            {postText}
          </span>
        )}

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeClosedIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {inputError && !hideError && <p className="mt-1 text-xs text-red-500">{inputError}</p>}
    </div>
  );
}
