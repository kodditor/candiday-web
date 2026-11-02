import TextArea from "@/components/form/text-area";
import { type FormikProps } from "formik"

type Props = {
  form: FormikProps<any>;
  label: string;
  placeholder: string;
}

export function NotesForm({
  form,
  label,
  placeholder
}: Props){

  return (
    <>
      <form className="flex flex-col gap-6 p-6">
        <div>
          <TextArea
            label={label}
            placeholder={placeholder}
            id="notes"
            rows={8}
            {...form}
          />
        </div>
      </form>
    </>
  )
}