import { useRef, useState } from "react";
import lodash from "lodash";
import { uploadFile } from "@/lib/utils/upload";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadSimpleIcon, FileTextIcon, CircleNotchIcon } from "@phosphor-icons/react";


type Props = {
  id: string,
  label?: string;
  setFieldValue: (field: string, value: any) => void;
  disabled?: boolean;
  values?: any;
  errors?: any;
  touched?: any;
  hideError?: boolean;
  required?: boolean;
  className?: string;
}

export function UploadArea({ id, label, setFieldValue, disabled, values, errors, touched, required, className }: Props) {

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);


  const value = lodash.get(values, id);

  const inputError = lodash.get(errors, id) &&  lodash.get(touched, id) 
    ? lodash.get(errors, id)
    : "";

  return (
    <div className="flex flex-col w-full min-h-full flex-1">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          {label} {required && (<span className="text-red-500">*</span>)}
        </label>
      )}
      <label htmlFor="file-upload" className="w-full h-full flex flex-1">
        <Button
          variant="outline"
          type="button"
          onClick={() => fileUploadRef.current?.click()}
          className={
            cn(
              "min-h-50 w-full flex gap-2 items-center",
              "border border-gray-200 border-dashed",
              "hover:border-gray-300",
              "justify-center",
              "rounded-md",
              "py-4",
              inputError && "border-red-500",
              className
            )
          }
        >
          {
            Boolean(value) ? (
              <>
                <FileTextIcon size={16} strokeWidth={1.5} />
                Change File
              </>
            ): !isFileUploading ? (
              <>
                <UploadSimpleIcon size={16} strokeWidth={1.5} />
                Upload Document
              </>
            ) : (
              <>
                <CircleNotchIcon className="animate-spin" size={16} strokeWidth={1.5} />
                Uploading...
              </>
            )
          }
        </Button>
      </label>
      <input
        id="file-upload"
        name="file-upload"
        ref={fileUploadRef}
        disabled={disabled}
        type="file"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if(!file) return;
          setIsFileUploading(true)
          try {
            const url = await uploadFile(file)

            if(url){
              setFieldValue(id, url);
            } else {
              // Reset input value to allow re-upload
              e.target.value = "";
              toast.error("File upload failed. Please try again.");
            }
          } finally {
            setIsFileUploading(false)
          }
        }}
      />
    </div>
  )

}
