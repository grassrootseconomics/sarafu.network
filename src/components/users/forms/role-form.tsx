"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { SelectField } from "~/components/forms/fields/select-field";
import { Authorization } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { AccountRoleType } from "~/server/enums";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { UserRoleFormSchema } from "../schemas";

export type UserRoleFormType = z.infer<typeof UserRoleFormSchema>;

interface RoleFormProps {
  viewOnly?: boolean;
  initialValues: UserRoleFormType;
  isLoading?: boolean;
  buttonLabel?: string;
  className?: string;
  onSubmit: (data: UserRoleFormType) => void;
}

export function RoleForm(props: RoleFormProps) {
  const form = useForm<UserRoleFormType>({
    resolver: zodResolver(UserRoleFormSchema),
    mode: "onBlur",
    values: props.initialValues,
  });

  const onSubmit = (data: UserRoleFormType) => props.onSubmit(data);

  return (
    <Authorization resource="Users" action="UPDATE_ROLE">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("space-y-4 p-4 border rounded-lg bg-amber-50/50", props.className)}
        >
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-amber-800">
              Update User Role
            </h3>
            <p className="text-sm text-amber-700">
              This action will change the user&apos;s permissions and access level.
            </p>
          </div>

          <SelectField
            form={form}
            name="role"
            label="Role"
            items={Object.keys(AccountRoleType).map((value) => ({
              value: value,
              label: value,
            }))}
            disabled={props.viewOnly}
          />

          <div className="flex justify-end pt-2">
            <Button 
              disabled={props.isLoading || props.viewOnly} 
              type="submit"
              variant="destructive"
            >
              {props.isLoading ? <Loading /> : (props.buttonLabel || "Update Role")}
            </Button>
          </div>
        </form>
      </Form>
    </Authorization>
  );
}