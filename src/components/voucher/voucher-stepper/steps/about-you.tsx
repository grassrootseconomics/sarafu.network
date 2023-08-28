import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { getLocation } from "~/lib/geocoder";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";

const LocationMapButton = dynamic(
  () => import("~/components/map/location-map-button"),
  {
    ssr: false,
  }
);

export const aboutYouSchema = z
  .object({
    type: z.enum(["group", "personal"], {
      required_error: "You need to select a type.",
    }),
    name: z
      .string()
      .min(2, {
        message: "Username must be at least 2 characters.",
      })
      .max(30, {
        message: "Username must not be longer than 30 characters.",
      }),
    contactInformation: z
      .string({
        required_error: "Please select an email to display.",
      })
      .email(),
    authorized: z.enum(["yes", "no"]),
    geo: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .required(),
    location: z.string().nonempty("Location is required"),
  })
  .refine(
    (schema) =>
      schema.type === "personal" ||
      (schema.type === "group" && schema.authorized === "yes"),
    {
      message: "You need to be authorized.",
      path: ["authorized"],
    }
  );
export type FormValues = z.infer<typeof aboutYouSchema>;

// This can come from your database or API.
const defaultValues: Partial<FormValues> = {
  authorized: "no",
  type: "personal",
};

export const AboutYouStep = () => {
  const { values, onValid } = useVoucherForm("aboutYou");

  const form = useForm<FormValues>({
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
              <FormLabel>Who does this voucher represent</FormLabel>
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
                    <FormLabel className="font-normal">Personal</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="group" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Entity or Association
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Grassroots Economics" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInformation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information</FormLabel>
              <FormControl>
                <Input placeholder="Contact Information" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormField
            control={form.control}
            name="geo"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <div className="flex justify-center space-x-1">
                    <div className="flex flex-col">
                      <FormLabel className="p-1">Latitude</FormLabel>
                      <Input
                        placeholder="Latitude"
                        value={field.value?.x}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (isNaN(value) || value > 90 || value < -90) return;
                          form.setValue(field.name, {
                            ...field.value,
                            x: value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <FormLabel className="p-1">Longitude</FormLabel>
                      <Input
                        placeholder="Longitude"
                        value={field.value?.y}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (isNaN(value) || value > 180 || value < -180)
                            return;
                          form.setValue(field.name, {
                            ...field.value,
                            y: value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <FormLabel className="h-5"></FormLabel>
                      <LocationMapButton
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        value={
                          field.value
                            ? { lat: field.value.x, lng: field.value.y }
                            : undefined
                        }
                        onSelected={(d) => {
                          if (d) {
                            form.setValue("geo", { x: d.lat, y: d.lng });
                            getLocation(d)
                              .then((location) => {
                                form.setValue("location", location);
                              })
                              .catch(console.error);
                          }
                        }}
                      />
                    </div>
                  </div>
                </FormControl>
                {<FormMessage /> || <FormDescription></FormDescription>}
              </FormItem>
            )}
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
                {<FormMessage /> || (
                  <FormDescription>
                    This is the name of the location where the voucher is valid
                  </FormDescription>
                )}
              </FormItem>
            )}
          />
        </div>
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
