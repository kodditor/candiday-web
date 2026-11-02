import { ImageUploadField } from "@/components/form/image-upload-field";

type LogoUploadFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function LogoUploadField({
  value,
  onChange,
  error,
  disabled,
}: LogoUploadFieldProps) {
  return (
    <ImageUploadField
      id="organization-logo"
      label="Organization Logo"
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      emptyLabel="Upload a logo (optional)"
    />
  );
}
