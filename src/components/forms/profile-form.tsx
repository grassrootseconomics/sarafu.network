import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "~/utils/api";
import { Loading } from "../loading";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { useToast } from "../ui/use-toast";
import { InputField } from "./fields/input-field";

export const UserProfileFormSchema = z.object({
  year_of_birth: z.coerce.number().nullable(),
  gender: z.string().nullable(),
  family_name: z.string().nullable(),
  given_names: z.string().nullable(),
  location_name: z.string().nullable(),
});

export type UserProfileFormType = z.infer<typeof UserProfileFormSchema>;

const defaultValues: Partial<UserProfileFormType> = {
  year_of_birth: null,
  gender: null,
  family_name: null,
  given_names: null,
  location_name: null,
};

export const ProfileForm = () => {
  const { toast } = useToast();
  const { data: initialValues, refetch, isLoading } = api.user.me.useQuery();
  const { mutate, isLoading: isMutating } = api.user.updateMe.useMutation();
  console.log(initialValues)
  const form = useForm<UserProfileFormType>({
    resolver: zodResolver(UserProfileFormSchema),
    mode: "onBlur",
    values: initialValues,
  });

  const handleSubmit = (data: UserProfileFormType) => {
    console.log("data", data);
    mutate(data, {
      onSuccess: () => {
        refetch()
          .then(() => {
            toast({
              title: "Success",
              description: "Profile updated successfully",
              variant: "default",
            });
          })
          .catch((error) => {
            console.error(error);
            toast({
              title: "Error",
              description: (error as Error)?.message || "An error occurred",
              variant: "destructive",
            });
          });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (e) => console.error(e))}
        className="space-y-8"
      >
        <InputField
          form={form}
          name="given_names"
          placeholder="Given Names"
          label="Given Names"
        />
        <InputField
          form={form}
          name="family_name"
          placeholder="Family Name"
          label="Family Name"
        />
        <InputField
          form={form}
          name="year_of_birth"
          placeholder="Year of Birth"
          label="Year of Birth"
        />
        <InputField
          form={form}
          name="gender"
          placeholder="Gender"
          label="Gender"
        />
        <InputField
          form={form}
          name="location_name"
          placeholder="Location Name"
          label="Location Name"
        />

        <Button disabled={isMutating || isLoading} type="submit">
          {isMutating || isLoading ? <Loading /> : "Update"}
        </Button>
      </form>
    </Form>
  );
};
