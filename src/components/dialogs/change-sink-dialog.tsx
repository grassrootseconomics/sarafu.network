import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { useContractWrite, useQueryClient } from "wagmi";
import * as z from "zod";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { api } from "~/utils/api";
import { InputField } from "../forms/fields/input-field";
import { Loading } from "../loading";
import Hash from "../transactions/hash";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  sinkAddress: z.string().refine(isAddress, "Invalid address"),
});

const ChangeSinkAddressDialog = ({
  voucher,
  button,
}: {
  voucher: {
    id: number;
    voucher_address: string;
  };
  button?: React.ReactNode;
}) => {
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State to control dialog visibility

  const utils = api.useContext();
  // Get QueryClient from the context
  const queryClient = useQueryClient();
  const cache = queryClient.getQueryCache();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });
  const changeSink = useContractWrite({
    address: voucher.voucher_address as `0x${string}`,
    abi: abi,
    functionName: "setSinkAddress",

    onError: (error) => {
      toast.toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (data) => {
      setIsDialogOpen(false); // Close the dialog on success
      // queryClient.invalidateQueries({ queryKey: ['todos'] })

      toast.toast({
        title: "Success",
        description: <Hash hash={data.hash} />,
      });
    },
  });
  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    changeSink.write({
      args: [data.sinkAddress],
    });
  };
  const ChangeSinkForm = (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className="space-y-8"
      >
        <InputField form={form} name="sinkAddress" label="Sink Address" />

        <div className="flex justify-center">
          <Button type="submit" disabled={changeSink.isLoading}>
            {changeSink.isLoading ? <Loading /> : "Change Sink Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {button ? (
          button
        ) : (
          <Button variant={"ghost"} onClick={() => setIsDialogOpen(true)}>
            Change Community Fund
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Community Fund</DialogTitle>
          <DialogDescription>
            Change the address of the community fund
          </DialogDescription>
        </DialogHeader>
        {changeSink.isLoading ? <Loading /> : ChangeSinkForm}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeSinkAddressDialog;
