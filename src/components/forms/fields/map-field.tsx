import dynamic from "next/dynamic";
import { ControllerRenderProps, type UseFormReturn } from "react-hook-form";
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
  disableSearch?: boolean;
  name: FilterNamesByValue<F, { x: number; y: number } | null | undefined>;
  locationName?: FilterNamesByValue<F, string | null | undefined>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MapField<F extends UseFormReturn<any>>({
  form,
  label,
  name,
  description,
  locationName,
  disabled,
  disableSearch,
}: MapFormFieldProps<F>) {
  const handelUpdateLocation = (
    field: ControllerRenderProps<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      FilterNamesByValue<
        F,
        | {
            x: number;
            y: number;
          }
        | null
        | undefined
      >
    >,
    p: {
      latitude: number;
      longitude: number;
    }
  ) => {
    if (disabled) return;
    field.onChange({
      x: p.latitude,
      y: p.longitude,
    });
    if (!locationName) return;
    getLocation(p)
      .then((location) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        form.setValue(locationName, location);
      })
      .catch(console.error);
  };
  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="w-full h-96 max-h-[30vh] rounded-md overflow-clip">
                <LocationMap
                  disabled={disabled}
                  onCurrentLocation={(p) => handelUpdateLocation(field, p)}
                  showSearchBar={!Boolean(disableSearch)}
                  value={
                    field.value
                      ? {
                          latitude: field.value.x as number,
                          longitude: field.value.y as number,
                        }
                      : undefined
                  }
                  onChange={(p) => handelUpdateLocation(field, p)}
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
