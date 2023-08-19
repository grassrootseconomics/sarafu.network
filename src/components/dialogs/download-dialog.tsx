/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { DatePickerWithRange } from "../date-picker";
import { Loading } from "../loading";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface DownloadDialogProps<
  QueryFunction extends (...args: any[]) => {
    data: object;
    isLoading: boolean;
    isSuccess: boolean;
    isFetching: boolean;
    refetch: () => Promise<object>;
  },
  QueryArgs extends Parameters<QueryFunction>
> {
  useQuery: QueryFunction;
  args: QueryArgs[0];
}

const FormSchema = z.object({
  date_range: z.object({
    from: z.date({
      required_error: "A start date is required.",
    }),
    to: z.date({
      required_error: "A end date is required.",
    }),
  }),
  type: z.enum(["csv", "json"]),
});

const DownloadDialog = <
  QueryFunction extends (...args: any[]) => {
    data: object;
    isLoading: boolean;
    isSuccess: boolean;
    isFetching: boolean;
    refetch: () => Promise<{ data: object | undefined }>;
  },
  QueryArgs extends Parameters<QueryFunction>
>({
  useQuery,
  args,
}: DownloadDialogProps<QueryFunction, QueryArgs>) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<z.infer<typeof FormSchema>>();
  const query = useQuery(
    {
      ...args,
      dateRange: data?.date_range
        ? {
            start: data.date_range.from,
            end: data.date_range.to,
          }
        : undefined,
    },
    {
      enabled: false,
    }
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    setData(data);
    query
      .refetch()
      .then((res) => {
        if (res?.data) {
          exportToJson(res?.data);
          setOpen(false);
        } else {
          console.error(res);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={"ghost"} className="m-1">
          <DownloadIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Download</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="date_range"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Range</FormLabel>
                  <DatePickerWithRange
                    value={field.value}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    onChange={field.onChange}
                  />
                  <FormDescription>
                    Select the range of data to download
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value as "csv" | "json")
                      }
                      defaultValue={field.value ?? ("csv" as const)}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="csv" />
                        </FormControl>
                        <FormLabel className="font-normal">CSV</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="json" />
                        </FormControl>
                        <FormLabel className="font-normal">JSON</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button disabled={query.isFetching} type="submit">
                {query.isFetching ? <Loading /> : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
const downloadFile = ({
  data,
  fileName,
  fileType,
}: {
  data: string;
  fileName: string;
  fileType: string;
}) => {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([data], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
};

const exportToJson = (data: object) => {
  downloadFile({
    data: JSON.stringify(data),
    fileName: "transactions.json",
    fileType: "text/json",
  });
};

export default DownloadDialog;
