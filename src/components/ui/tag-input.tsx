import React, { useState, useCallback } from 'react';
import lodash from 'lodash';
import { cn } from '@/lib/cn';

const Tag = ({ text, onRemove }: { text: string; onRemove: () => void }) => (
  <div className="flex items-center bg-zinc-100 text-zinc-800 text-sm font-medium pl-3 pr-1 py-1 rounded-full mr-2 transition-all duration-200">
    {text}
    <button
      onClick={onRemove}
      className="ml-1 p-1 text-zinc-600 hover:text-zinc-900 focus:outline-none"
      aria-label={`Remove tag: ${text}`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  </div>
);

type Props = {
  id: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  values: Record<string, string[] | undefined>;
  setFieldValue: (field: string, value: string[]) => void;
  setFieldTouched: (field: string, value: boolean) => void;
  handleBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: any;
  touched?: any;
  hideError?: boolean;
  required?: boolean;
}

const TagInput = ({ 
  values, 
  setFieldValue, 
  id, 
  label, 
  placeholder,
  disabled = false,
  handleBlur,
  handleFocus,
  errors,
  touched,
  setFieldTouched,
  hideError = false,
  required = false
}: Props) => {
  const [inputValue, setInputValue] = useState('');
  
  const fieldValue = lodash.get(values, id);

  // Ensure values is always treated as an array
  const currentTags = Array.isArray(fieldValue) ? fieldValue : [];

  const updateExternalTags = useCallback((newTags: string[]) => {
    if (setFieldValue && id) {
        setFieldValue(id, newTags);
    }
  }, [setFieldValue, id]);

  // Function to add a tag
  const addTag = useCallback((text: string) => {
    const newTag = text.trim();
    
    if (newTag && !currentTags.includes(newTag)) {
      // Create a new array including the new tag
      const updatedTags = [...currentTags, newTag];
      updateExternalTags(updatedTags);
    }
  }, [currentTags, updateExternalTags]);

  // Function to remove a tag by its index
  const removeTag = useCallback((indexToRemove: number) => {
    const updatedTags = currentTags.filter((_, index) => index !== indexToRemove);
    updateExternalTags(updatedTags);
  }, [currentTags, updateExternalTags]);


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const newTagText = inputValue.trim();

    // 1. Tag Creation (Comma or Enter)
    if (event.key === ',' || event.key === 'Enter') {
      event.preventDefault(); 
      if (newTagText) {
        addTag(newTagText);
        setInputValue('');
      }
    }

    // 2. Tag Removal (Backspace on empty input)
    if (event.key === 'Backspace' && !newTagText && currentTags.length > 0) {
      const updatedTags = currentTags.slice(0, -1);
      updateExternalTags(updatedTags);
    }
  };


  const inputError = lodash.get(errors, id) && lodash.get(touched, id)
    ? lodash.get(errors, id)
    : "";

  return (
    <div className="">
      {
        label && (
          <label className="block mb-1.5 text-sm font-medium text-gray-700" htmlFor={id}>
            {label} {required && (<span className="text-red-500">*</span>)}
          </label>
        )
      }
      <div
        className={cn(
          `flex flex-wrap items-center w-full px-3 border border-gray-300 focus-within:ring-1 focus-within:ring-black transition-all duration-150`,
          inputError ? "border-red-500" : "border-gray-300",
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white",
        )}
      >
        {currentTags.map((tag, index) => (
          <Tag
            key={tag}
            text={tag}
            onRemove={() => removeTag(index)}
          />
        ))}

        <input
          id="tag-input"
          type="text"
          disabled={disabled}
          onBlur={(e) => {
            handleBlur && handleBlur(e);
            setFieldTouched && setFieldTouched(id, true);
          }}
          onFocus={handleFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentTags.length === 0 ? placeholder || "Add your tags..." : ""}
          className="flex-1 py-2 bg-transparent outline-none text-sm text-gray-900"
        />
      </div>

      {inputError && !hideError && <p className="mt-1 text-xs text-red-500">{inputError}</p>}
    </div>
  );
};

export default TagInput;