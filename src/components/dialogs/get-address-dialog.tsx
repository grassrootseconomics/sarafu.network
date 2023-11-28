import { SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { isAddress } from "viem";
import { api } from "~/utils/api";
import { Loading } from "../loading";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FormDescription, FormItem } from "../ui/form";
import { Input } from "../ui/input";

interface GetAddressDialogProps {
  disabled?: boolean;
  onAddress: (address: `0x${string}`) => void;
  button?: React.ReactNode;
}

const GetAddressDialog = ({
  onAddress,
  button,
  disabled,
}: GetAddressDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Query to get address by phone number
  const { refetch, isFetching } = api.user.getAddressBySearchTerm.useQuery(
    {
      searchTerm: searchTerm,
    },
    { enabled: false, cacheTime: 0 }
  );

  // Function to trigger the search
  const search = () => {
    refetch()
      .then((res) => {
        if (
          res.data?.blockchain_address &&
          isAddress(res.data.blockchain_address)
        ) {
          onAddress(res.data.blockchain_address);
          setSearchTerm("");
          setIsOpen(false);
        } else {
          setError("No user found with that phone number or alias");
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {button ?? (
          <Button
            disabled={disabled}
            variant={"outline"}
            onClick={() => setIsOpen(true)}
          >
            <SearchIcon />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Search</DialogTitle>
        <FormItem>
          <Input
            type={"text"}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            placeholder={"Phone number or alias"}
          />
          <FormDescription>
            Search for a user by phone number or alias
          </FormDescription>
          {error && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {error}
            </p>
          )}
        </FormItem>
        <Button disabled={isFetching} onClick={search}>
          {isFetching ? <Loading /> : "Search"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default GetAddressDialog;
