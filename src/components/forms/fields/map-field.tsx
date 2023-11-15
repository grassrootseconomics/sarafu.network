import dynamic from "next/dynamic";
import { type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { getLocation } from "~/lib/geocoder";
import { InputField } from "./input-field";
import { type FilterNamesByValue } from "./type-helper";

const LocationMap = dynamic(() => import("~/components/map/location-map"), {
  ssr: false,
});

interface MapFormFieldProps<F extends UseFormReturn> {
  label: string;
  form: F;
  description?: string;
  disabled?: boolean;
  name: FilterNamesByValue<F, { x: number; y: number } | null>;
  locationName?: FilterNamesByValue<F, string | null>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MapField<F extends UseFormReturn<any>>({
  form,
  label,
  name,
  description,
  locationName,
  disabled,
}: MapFormFieldProps<F>) {
  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="w-full h-96 rounded-md overflow-clip">
                <LocationMap
                  disabled={disabled}
                  value={
                    field.value
                      ? {
                          lat: field.value.x as number,
                          lng: field.value.y as number,
                        }
                      : undefined
                  }
                  onChange={(p) => {
                    if (disabled) return;
                    field.onChange({
                      x: p.lat,
                      y: p.lng,
                    });
                    if (!locationName) return;
                    getLocation(p)
                      .then((location) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        form.setValue(locationName, location);
                      })
                      .catch(console.error);
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
            <FormDescription>{description}</FormDescription>
          </FormItem>
        )}
      />
      {locationName && (
        <InputField
          form={form}
          name={locationName}
          placeholder="Location Name"
          label="Location Name"
        />
      )}
    </>
  );
}
