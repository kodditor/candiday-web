import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import lodash from 'lodash';

import { cn } from "@/lib/utils"

function RawSwitch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-statute data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 group-data-[size=sm]/switch:data-[state=checked]:translate-x-2.5"
      />
    </SwitchPrimitive.Root>
  )
}

interface SwitchProps {
  id: string;
  label?: string;
  setFieldValue?: (field: string, value: any) => void;
  disabled?: boolean;
  handleBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  handleFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  values?: any;
  errors?: any;
  touched?: any;
  required?: boolean;
}

export default function Switch({
  id,
  label,
  setFieldValue,
  disabled = false,
  values,
  errors,
  touched,
  handleBlur,
  handleFocus,
  required,
}: SwitchProps) {

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
      <RawSwitch
        id={id}
        name={id}
        checked={Boolean(lodash.get(values, id))}
        onCheckedChange={(checked) => {
          setFieldValue?.(id, checked);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      />

      {inputError && <p className="mt-1 text-xs text-red-500">{inputError}</p>}
    </div>
  );
}



export { Switch }
