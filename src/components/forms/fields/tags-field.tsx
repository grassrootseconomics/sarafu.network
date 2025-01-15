/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import { trpc } from "~/lib/trpc";
import { ComboBoxField } from "./combo-box-field";
import { type FormValues } from "./type-helper";

interface TagsFieldProps<Form extends UseFormReturn> {
  name: FieldPath<FormValues<Form>>;
  mode: "multiple" | "single";
  form: Form;
  label: string;
  description?: string;
  placeholder: string;
}
export function TagsField<Form extends UseFormReturn<any>>(
  props: TagsFieldProps<Form>
) {
  const tags = trpc.tags.list.useQuery();
  const createTag = trpc.tags.create.useMutation();

  return (
    <ComboBoxField
      form={props.form}
      name={props.name}
      label={props.label}
      description={props.description}
      placeholder={props.placeholder}
      getValue={(item) => item?.tag}
      // @ts-expect-error Ignore
      getLabel={(item) => item?.tag || item}
      options={tags?.data ?? []}
      mode={props.mode}
      onCreate={async (value) => {
        const tag = await createTag.mutateAsync({ name: value });
        await tags.refetch();
        return tag;
      }}
    />
  );
}
