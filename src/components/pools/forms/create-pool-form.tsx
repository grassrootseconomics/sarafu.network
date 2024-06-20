import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputField } from "~/components/forms/fields/input-field";
import { RadioField } from "~/components/forms/fields/radio-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/useAuth";

const createPoolSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  poolName: z.string(),
  serviceType: z.string(),
  representation: z.string(),
});
export function CreatePoolForm() {
  const auth = useAuth();
  const form = useForm<z.infer<typeof createPoolSchema>>({
    resolver: zodResolver(createPoolSchema),
    defaultValues: {
      firstName: auth?.user?.firstName || "",
      lastName: auth?.user?.lastName || "",
    },
  });

  const onSubmit = (data: z.infer<typeof createPoolSchema>) => {
    console.log(data);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 my-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-4">
            <InputField
              form={form}
              name="firstName"
              label="First name"
              placeholder="Name"
              type="text"
            />
            <InputField
              form={form}
              name="lastName"
              label="Last name"
              placeholder="Surname"
              type="text"
            />
          </div>
          <InputField
            form={form}
            name="poolName"
            label="What do you want to call your pool?"
            placeholder="Enter pool name here"
            type="text"
          />
          <SelectField
            form={form}
            label="What type of service/product will you provide?"
            name="serviceType"
            items={[
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
              { label: "Option 3", value: "option3" },
            ]}
          />
          <RadioField
            form={form}
            label="Who will be representing the pool?"
            description="Selecting yourself means you will be the sole representative of the pool. Selecting a business or organization means you will be the representative of the pool."
            name="representation"
            items={[
              { label: "myself", value: "myself" },
              { label: "a business or an organization", value: "business" },
            ]}
          />
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Next
          </Button>
        </form>
      </Form>
    </div>
  );
}
