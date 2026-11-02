import TextInput from "@/components/form/input";
import SelectInput from "@/components/form/select";
import { formatOrgRole } from "@/lib/types/team-member.type";
import { type FormikProps } from "formik";

export * from "./schema";

type Props = {
  form: FormikProps<{
    email: string;
    role: string;
  }>;
};

const roleOptions = [
  { label: formatOrgRole("org:member"), value: "org:member" },
  { label: formatOrgRole("org:admin"), value: "org:admin" },
];

export function InviteTeamMemberForm({ form }: Props) {
  return (
    <form className="flex flex-col gap-6 p-6">
      <TextInput
        label="Email"
        placeholder="colleague@company.com"
        id="email"
        type="email"
        required
        {...form}
      />

      <SelectInput
        id="role"
        label="Role"
        required
        handleChange={form.handleChange}
        values={form.values}
        errors={form.errors}
        touched={form.touched}
        options={roleOptions}
      />
    </form>
  );
}
