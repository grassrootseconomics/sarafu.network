"use client";
import Image from "next/image";
import { toast } from "sonner";
import { ContentContainer } from "~/components/layout/content-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  ProfileForm,
  type UserProfileFormType,
} from "~/components/users/forms/profile-form";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";

export const Profile = () => {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.me.update.useMutation();
  const auth = useAuth();
  const updateUser = (values: UserProfileFormType) => {
    mutateAsync(values)
      .then(() => {
        toast.success("Profile updated");
        void utils.me.invalidate();
      })
      .catch((err: Error) => {
        toast.error(err.message);
      });
  };
  return (
    <ContentContainer title="Profile">
      <div className="w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
        <div className="col-span-12 mx-auto md:min-w-[60%] min-w-full flex flex-col gap-2 items-center justify-center text-center">
          <Avatar className="flex-none h-24 w-24">
            <AvatarImage asChild  src={"/apple-touch-icon.png"} >
              <Image  src={"/apple-touch-icon.png"}  alt="" width={96} height={96} />
            </AvatarImage>
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="flex-1 flex-col items-center justify-center text-center">
            <div className="text-md font-semibold">
              {auth?.user?.given_names ?? "Unknown"}
            </div>
            <div className="text-sm font-semibold text-primary/80">
              {auth?.user?.vpa}
            </div>
          </div>
        </div>
        <Tabs
          defaultValue="profile"
          className="m-2 col-span-12 mt-2 mx-auto md:min-w-[60%] min-w-full"
        >
          <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger disabled={true} value="vouchers">
              Vouchers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-0">
            <div className="p-4">
              {auth?.user && (
                <ProfileForm
                  buttonLabel="Update"
                  isLoading={isPending}
                  initialValues={auth?.user}
                  onSubmit={updateUser}
                />
              )}
            </div>
          </TabsContent>
          <TabsContent value="vouchers" className="mt-0"></TabsContent>
        </Tabs>
      </div>
    </ContentContainer>
  );
};
