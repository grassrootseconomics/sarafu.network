"use client";
import { SearchIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLookupPhoneNumber } from "~/lib/sarafu/lookup";
import { useENSAddress } from "~/lib/sarafu/resolver";
import { isPhoneNumber } from "~/utils/phone-number";
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
  const [error] = useState<string | null>(null);
  // Query to get address by phone number
  const ens = useENSAddress({
    ensName: searchTerm,
  });
  const lookup = useLookupPhoneNumber(searchTerm, isPhoneNumber(searchTerm));
  useEffect(() => {
    if (ens.data) {
      onAddress(ens.data.address);
      setSearchTerm("");
      setIsOpen(false);
    }
  }, [ens.data, onAddress]);
  useEffect(() => {
    if (lookup.data) {
      onAddress(lookup.data);
      setSearchTerm("");
      setIsOpen(false);
    }
  }, [lookup.data, onAddress]);
  // Function to trigger the search

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
      </DialogContent>
    </Dialog>
  );
};

export default GetAddressDialog;
