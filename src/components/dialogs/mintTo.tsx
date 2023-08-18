import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAddress, parseUnits } from "viem";
import { useAccount, useBalance, useContractWrite } from "wagmi";
import * as z from "zod";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import Hash from "../hash";
import { Loading } from "../loading";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  amount: z.number().positive(),
  recipientAddress: z.string().refine(isAddress, "Invalid recipient address"),
});

const MintToDialog = ({
  voucher,
}: {
  voucher: {
    id: number;
    voucher_address: string;
  };
}) => {
  const toast = useToast();
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: voucher.voucher_address as `0x${string}`,
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });
  const mintTo = useContractWrite({
    address: voucher.voucher_address as `0x${string}`,
    abi: abi,
    functionName: "mintTo",
    onError: (error) => {
      toast.toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (data) => {
      toast.toast({
        title: "Success",
        description: <Hash hash={data.hash} />,
      });
    },
  });
  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    mintTo.write({
      args: [
        data.recipientAddress,
        parseUnits(data.amount.toString() ?? "", balance.data?.decimals ?? 6),
      ],
    });
  };
  const MintToForm = (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="recipientAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient</FormLabel>
              <FormControl>
                <Input placeholder="0x..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="Amount"
                  {...form.register("amount", {
                    valueAsNumber: true,
                  })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <Button type="submit" disabled={mintTo.isLoading}>
            {mintTo.isLoading ? <Loading /> : "MintTo"}
          </Button>
        </div>
      </form>
    </Form>
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>Mint To</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MintTo</DialogTitle>
          <DialogDescription>Mint to an Address</DialogDescription>
        </DialogHeader>
        {mintTo.isLoading ? <Loading /> : MintToForm}
      </DialogContent>
    </Dialog>
  );
};

export default MintToDialog;
