import TextInput from "@/components/form/input";
import SelectInput from "@/components/form/select";
import Switch from "@/components/ui/switch";
import { UserRoles } from "@/lib/types/user.type";
import { type FormikProps } from "formik"
import lodash from 'lodash';
import { useUser } from "@/lib/context/user-context";

export * from "./schema";

type Props = {
  form: FormikProps<any>
}

export function UserForm({
  form
}: Props){

  const currentUser = useUser(state => state.user);

  return (
    <>
      <form className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <TextInput
          label="First Name"
          placeholder="Kwame"
          id="firstName"
          type="text"
          {...form}
        />
        <TextInput
          label="Last Name"
          placeholder="Mensah"
          id="lastName"
          type="text"
          {...form}
        />
      </div>

      <div>
        <TextInput
          id="phone"
          label="Phone Number"
          placeholder={"0240000000"}
          type="text"
          {...form}
        />
      </div>

      <div>
        <TextInput
          id="email"
          label="Email Address"
          placeholder="example@gmail.com"
          type="email"
          {...form}
        />
      </div>
      <div>
        <SelectInput
          id="role"
          label="Role"
          placeholder="--- Select a Role ---"
          options={UserRoles.filter((rl) => rl !== "SuperAdmin" && (currentUser?.role === "SuperAdmin" ? true : rl !== "Admin")).map((role) => (
            {
              label: lodash.startCase(role),
              value: role
            }
          ))}
          {...form}
        />
      </div>

      <div>
        <Switch
          id="isDriver"
          label="Is Driver"
          {...form}
        />
      </div>
    </form>
    </>
  )

}