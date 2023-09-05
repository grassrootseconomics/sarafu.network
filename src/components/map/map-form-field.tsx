import dynamic from "next/dynamic";
import { type FieldPathByValue, type UseFormReturn } from "react-hook-form";
import { getLocation } from "~/lib/geocoder";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
});

interface MapFormFieldProps<F extends UseFormReturn> {
  label: string;
  form: F;
  name: FieldPathByValue<GetFieldValues<F>, { x: number; y: number }>;
}
type GetFieldValues<F> = F extends UseFormReturn<infer V> ? V : unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MapFormField<F extends UseFormReturn<any>>({
  form,
  label,
  name,
}: MapFormFieldProps<F>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="w-full h-96 rounded-md overflow-clip">
              <LocationMap
                value={
                  field.value
                    ? {
                        lat: field.value.x as number,
                        lng: field.value.y as number,
                      }
                    : undefined
                }
                onChange={(p) => {
                  field.onChange({
                    x: p.lat,
                    y: p.lng,
                  });
                  getLocation(p)
                    .then((location) => {
                      form.setValue("location", location);
                    })
                    .catch(console.error);
                }}
              />
            </div>
          </FormControl>
          {<FormMessage /> || <FormDescription></FormDescription>}
        </FormItem>
      )}
    />
  );
}
