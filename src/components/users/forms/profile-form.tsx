import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "~/lib/utils";
import { InputField } from "../../forms/fields/input-field";
import { MapField } from "../../forms/fields/map-field";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";

export const UserProfileFormSchema = z.object({
  year_of_birth: z.coerce.number().nullable(),
  family_name: z.string().nullable(),
  given_names: z.string().nullable(),
  location_name: z.string().nullable(),
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
});

export type UserProfileFormType = z.infer<typeof UserProfileFormSchema>;

interface ProfileFormProps {
  viewOnly?: boolean;
  initialValues: UserProfileFormType;
  isLoading?: boolean;
  buttonLabel: string;
  className?: string;
  onSubmit: (data: UserProfileFormType) => void;
}
export const ProfileForm = (props: ProfileFormProps) => {
  const form = useForm<UserProfileFormType>({
    resolver: zodResolver(UserProfileFormSchema),
    mode: "onBlur",
    values: props.initialValues,
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(props.onSubmit)}
        className={cn("space-y-8", props.className)}
      >
        <InputField
          form={form}
          name="given_names"
          placeholder="Given Names"
          label="Given Names"
          disabled={props.viewOnly}
        />
        <InputField
          form={form}
          name="family_name"
          placeholder="Family Name"
          label="Family Name"
          disabled={props.viewOnly}
        />
        <InputField
          form={form}
          name="year_of_birth"
          placeholder="Year of Birth"
          label="Year of Birth"
          disabled={props.viewOnly}
        />
        <MapField
          form={form}
          label="Location"
          disabled={props.viewOnly}
          name={"geo"}
          locationName={"location_name"}
        />
        <div className="flex justify-evenly align-middle">
          <Button disabled={props.isLoading || props.viewOnly} type="submit">
            {props.isLoading ? <Loading /> : props.buttonLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
