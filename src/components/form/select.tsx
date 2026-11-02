import { CaretDownIcon, CircleNotchIcon } from "@phosphor-icons/react";
import lodash from 'lodash';

interface Option {
  label: string;
  value: string | number;
}

interface SelectInputProps {
  id: string;
  label?: string;
  loading?: boolean;
  placeholder?: string;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  disabled?: boolean;
  handleBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  handleFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  values?: any;
  errors?: any;
  touched?: any;
  required?: boolean;
}

export default function SelectInput({
  id,
  label,
  placeholder = "Select an option",
  handleChange,
  options,
  disabled = false,
  values,
  errors,
  touched,
  handleBlur,
  handleFocus,
  loading,
  required,
}: SelectInputProps) {
  const inputError = lodash.get(errors, id) &&  lodash.get(touched, id) 
    ? lodash.get(errors, id)
    : "";

  return (
    <div className="w-full overflow-x-hidden">  
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          {label} {required && (<span className="text-red-500">*</span>)}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-md border shadow-sm px-3
          ${inputError ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      >
        <select
          id={id}
          name={id}
          value={lodash.get(values, id)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="flex-1 py-2 bg-transparent outline-none appearance-none text-sm placeholder:text-gray-600"
        >
          {placeholder && (
            <option value="" disabled hidden>
              {loading ? "Loading..." :placeholder}
            </option>
          )}
          { loading ? (
              <option value="" disabled hidden>
                Loading options...
              </option>
            ) : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>

        { loading 
          ? <CircleNotchIcon className="w-4 h-4 text-gray-400 ml-2 pointer-events-none animate-spin" />
          : <CaretDownIcon className="w-4 h-4 text-gray-400 ml-2 pointer-events-none" />
        }
        {/* Dropdown Icon */}
      </div>

      {inputError && <p className="mt-1 text-xs text-red-500">{inputError}</p>}
    </div>
  );
}
