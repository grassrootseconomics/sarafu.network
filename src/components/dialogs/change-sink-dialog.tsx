import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress } from "viem";
import { useWriteContract } from "wagmi";
import * as z from "zod";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { queryClient } from "~/lib/providers";
import { config } from "~/lib/web3";
import { AddressField } from "../forms/fields/address-field";
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

const FormSchema = z.object({
  sinkAddress: z.string().refine(isAddress, "Invalid address"),
});

const ChangeSinkAddressDialog = ({
  voucher_address,
  button,
}: {
  voucher_address: string;
  button?: React.ReactNode;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State to control dialog visibility

  // Get QueryClient from the context
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });
  const changeSink = useWriteContract({
    config: config,
    mutation: {
      onError: (error) => {
        toast.error(error.message);
      },

      onSuccess: (data) => {
        // Timeout to allow the transaction to be mined
        queryClient
          .refetchQueries({ queryKey: ["readContracts"] })
          .then(() => {
            setIsDialogOpen(false); // Close the dialog on success
            toast.success(<Hash hash={data} />);
          })
          .catch((err) => {
            console.error(err);
          });
      },
    },
  });
  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    changeSink.writeContract({
      address: voucher_address as `0x${string}`,
      abi: abi,
      functionName: "setSinkAddress",

      args: [data.sinkAddress],
    });
  };
  const ChangeSinkForm = (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className="space-y-8"
      >
        <AddressField form={form} name="sinkAddress" label="Sink Address" />

        <div className="flex justify-center">
          <Button type="submit" disabled={changeSink.isPending}>
            {changeSink.isPending ? <Loading /> : "Change Sink Address"}
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
        {changeSink.isPending ? <Loading /> : ChangeSinkForm}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeSinkAddressDialog;
