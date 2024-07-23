// External imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Internal imports

// Components
import { InputField } from "~/components/forms/fields/input-field";
import { MultiSelectField } from "~/components/forms/fields/multi-select-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { GasGiftStatus, InterfaceType } from "@grassroots/db/enums";

// Schema for user profile form
export const UsersFilterSchema = z.object({
  search: z.string().trim().nullish(),
  interfaceType: z.array(z.nativeEnum(InterfaceType)).nullish(),
  gasGiftStatus: z.array(z.nativeEnum(GasGiftStatus)).nullish(),
  limit: z.number().min(1).nullish(),
});

export type UsersFilterFormData = z.infer<typeof UsersFilterSchema>;
interface UsersFilterFormProps {
  className?: string;
  onFilter: (filters: UsersFilterFormData) => void;
  isLoading?: boolean;
}

export const UserFilterForm = (props: UsersFilterFormProps) => {
  const form = useForm<UsersFilterFormData>({
    resolver: zodResolver(UsersFilterSchema),
    mode: "onBlur",
    defaultValues: {
      search: "",
      interfaceType: [],
      gasGiftStatus: [],
    },
  });
  const onValid = (data: UsersFilterFormData) => {
    props.onFilter(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValid)}
        className={cn(
          "flex justify-between items-center flex-wrap",
          props.className
        )}
      >
        <div className="flex gap-2 flex-wrap flex-grow">
          <InputField
            form={form}
            name="search"
            placeholder="Phone Number or Address"
            label="Search"
            className="flex-1 space-y-1 min-w-[200px]"
          />

          <MultiSelectField
            form={form}
            name="interfaceType"
            label="Interface"
            items={Object.keys(InterfaceType).map((value) => ({
              value: value,
              label: value,
            }))}
            className="flex-1  min-w-[200px]"
          />
          <MultiSelectField
            form={form}
            name="gasGiftStatus"
            label="Gas Status"
            className="flex-1  min-w-[200px]"
            items={Object.keys(GasGiftStatus).map((value) => ({
              value: value,
              label: value,
            }))}
          />
          <div className="flex gap-2 justify-end">
            <Button
              disabled={!form.formState.isDirty}
              className="mt-auto"
              type="submit"
            >
              {props.isLoading ? <Loading /> : "Search"}
            </Button>
            <Button
              type="button"
              variant={"secondary"}
              disabled={!form.formState.isDirty}
              className="mt-auto"
              onClick={() => {
                form.reset();
                void form.handleSubmit(onValid)(undefined);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
