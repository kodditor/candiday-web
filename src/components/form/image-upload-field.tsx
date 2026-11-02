import { useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/lib/utils/upload";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

type ImageUploadFieldProps = {
  id?: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  previewClassName?: string;
  emptyLabel?: string;
  helperText?: string;
};

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  error,
  disabled = false,
  previewClassName = "size-16 rounded-lg",
  emptyLabel = "Upload an image",
  helperText = "PNG, JPG, WEBP, or SVG up to 2MB.",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { getToken } = useAuth();

  const handleFileChange = async (file?: File) => {
    if (!file || disabled) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Upload a PNG, JPG, WEBP, or SVG image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 2MB or smaller.");
      return;
    }

    setIsUploading(true);

    try {
      const token = await getToken();
      const url = await uploadFile(file, token);
      onChange(url);
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "rounded-xl border border-dashed border-hairline bg-paper p-4",
          error && "border-destructive",
          disabled && "opacity-60",
        )}
      >
        {value ? (
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex items-center justify-center overflow-hidden border border-hairline bg-paper-raised outline outline-1 outline-black/10",
                previewClassName,
              )}
            >
              <img
                src={value}
                alt={`${label} preview`}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading || disabled}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange("")}
                disabled={isUploading || disabled}
              >
                <TrashIcon className="size-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || disabled}
            className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg text-sm text-text-secondary transition-transform active:scale-[0.98]"
          >
            {isUploading ? (
              <>
                <UploadSimpleIcon className="size-5 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="size-5 text-statute" />
                {emptyLabel}
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-text-muted">{helperText}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />
    </div>
  );
}
