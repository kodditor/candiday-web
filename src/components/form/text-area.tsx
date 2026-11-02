import lodash from 'lodash';

interface TextAreaProps {
  id: string,
  label?: string;
  placeholder?: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
  handleBlur?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFocus?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  values?: any;
  errors?: any;
  touched?: any;
  rows?: number;
  cols?: number;
}

export default function TextArea({
  id,
  label,
  placeholder = "",
  handleChange,
  disabled = false,
  values,
  errors,
  touched,
  handleBlur,
  handleFocus,
  rows,
  cols,
}: TextAreaProps) {

  const inputError = lodash.get(errors, id) &&  lodash.get(touched, id) 
    ? lodash.get(errors, id)
    : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`flex items-center border shadow-sm px-3 rounded
          ${inputError ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      >
      

        {/* Input */}
        <textarea
          id={id}
          name={id}
          placeholder={placeholder}
          value={lodash.get(values, id)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          rows={rows}
          cols={cols}
          className="flex-1 py-2 bg-transparent outline-none text-sm text-gray-900"
        />
      </div>

      {inputError && <p className="mt-1 text-xs text-red-500">{inputError}</p>}
    </div>
  );
}
