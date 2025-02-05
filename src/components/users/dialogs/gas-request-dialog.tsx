"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveModal } from "~/components/modal";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { Button } from "../../ui/button";
import { ProfileForm, type UserProfileFormType } from "../forms/profile-form";
const GasRequestDialog = () => {
  const auth = useAuth();
  const updateMe = trpc.me.update.useMutation();
  const utils = trpc.useUtils();
  const requestGas = trpc.me.requestGas.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const applyAndUpdateProfile = async (data: UserProfileFormType) => {
    try {
      await updateMe.mutateAsync(data);
      await requestGas.mutateAsync();
      toast.success("Your request has been sent");
      setIsOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      await utils.me.invalidate();
    }
  };
  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Sign-Up for a Social Account"
      description="Please update your profile to receive free access"
      button={<Button variant={"destructive"}>Apply Now</Button>}
    >
      {auth?.user && (
        <ProfileForm
          buttonLabel="Apply"
          initialValues={auth.user}
          onSubmit={applyAndUpdateProfile}
          isLoading={updateMe.isPending || requestGas.isPending}
        />
      )}
    </ResponsiveModal>
  );
};

export default GasRequestDialog;
