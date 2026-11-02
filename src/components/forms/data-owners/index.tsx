import TextInput from "@/components/form/input";
import SelectInput from "@/components/form/select";
import Switch from "@/components/ui/switch";
import { DataOwnerDigestFrequencies } from "@/lib/types/data-owner.type";
import { type FormikProps } from "formik";
import lodash from "lodash";

export * from "./schema";

type Props = {
  form: FormikProps<any>
}

export function DataOwnerForm({ form }: Props) {
  return (
    <form className="flex flex-col gap-6 p-6">
      <TextInput
        label="Name"
        placeholder="Jane Doe"
        id="name"
        type="text"
        required
        {...form}
      />

      <TextInput
        label="Email"
        placeholder="jane@company.com"
        id="email"
        type="email"
        required
        {...form}
      />

      <TextInput
        label="Role"
        placeholder="Data Protection Lead"
        id="role"
        type="text"
        {...form}
      />

      <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SelectInput
            id="digestFrequency"
            label="Digest frequency"
            required
            handleChange={form.handleChange}
            values={form.values}
            errors={form.errors}
            touched={form.touched}
            options={DataOwnerDigestFrequencies.map((frequency) => ({
              label: lodash.startCase(frequency),
              value: frequency,
            }))}
          />
        </div>

        <div className="flex-1">
          <Switch
            id="notificationsEnabled"
            label="Enable notifications"
            {...form}
          />
        </div>
      </div>
    </form>
  );
}
