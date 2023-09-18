import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MapFormField } from "~/components/map/map-form-field";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import { aboutYouSchema, type AboutYouFormValues } from "../schemas/about-you";

// This can come from your database or API.
const defaultValues: Partial<AboutYouFormValues> = {
  type: "personal",
};

export const AboutYouStep = () => {
  const { values, onValid } = useVoucherForm("aboutYou");

  const form = useForm<AboutYouFormValues>({
    resolver: zodResolver(aboutYouSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
    progressive: true,
  });

  const type = form.watch("type");
  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Who is the issuer of this voucher and liable to redeem is as
                payment?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="personal" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Personal (You yourself)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="group" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Entity or Association that you duly represent
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === "group" && (
          <>
            <FormField
              control={form.control}
              name="authorized"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    Are you a duly authorized representation of an entity or
                    association?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {type === "group" ? "Entity/Association Name" : "Your Name"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    type === "group" ? "Grassroots Economics" : "James Webb"
                  }
                  {...field}
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    type === "group" ? "james@grassecon.org" : "james@gmail.com"
                  }
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the email address that people can contact you on.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://grassecon.org" {...field} />
              </FormControl>
              <FormDescription>
                If you have a website, you can enter it here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <MapFormField
          form={form}
          label="Where can this Voucher be redeemed?"
          name={"geo"}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Location Name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name of the location where the voucher is valid
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
