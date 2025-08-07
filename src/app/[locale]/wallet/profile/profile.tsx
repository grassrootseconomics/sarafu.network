"use client";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Address from "~/components/address";
import Identicon from "~/components/identicon";
import { ContentContainer } from "~/components/layout/content-container";
import { ResponsiveModal } from "~/components/modal";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  ProfileForm,
  type UserProfileFormType,
} from "~/components/users/forms/profile-form";
import { UpsertENSForm } from "~/components/users/forms/update-ens-form";
import { useAuth } from "~/hooks/useAuth";
import { useENS } from "~/lib/sarafu/resolver";
import { trpc } from "~/lib/trpc";

export function Profile() {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.me.update.useMutation();
  const auth = useAuth();
  const ens = useENS({
    address: auth?.account?.address,
  });
  const t = useTranslations("profile");
  const tSuccess = useTranslations("success");
  const tCommon = useTranslations("common");
  const tButtons = useTranslations("buttons");
  const tNav = useTranslations("navigation");
  const updateUser = (values: UserProfileFormType) => {
    mutateAsync(values)
      .then(() => {
        toast.success(tSuccess("profileUpdated"));
        void utils.me.invalidate();
      })
      .catch((err: Error) => {
        toast.error(err.message);
      });
  };

  return (
    <ContentContainer title={t("title")} className="pb-4 md:pb-0 bg-transparent">
      <div className="w-full mt-4 flex flex-col flex-grow mx-auto px-1 sm:px-2 gap-6">
        <Card className="mx-auto md:min-w-[60%] min-w-full">
          <CardHeader className="items-center text-center">
            <Avatar className="flex-none h-24 w-24 mb-4">
              <Identicon address={auth?.account?.address ?? ""} size={96} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">
              {auth?.user?.given_names ?? t("unknownUser")}
            </CardTitle>
            <CardDescription className="flex flex-col sm:flex-row items-center gap-2">
              <Address address={auth?.account?.address ?? ""} />
              <ResponsiveModal
                button={
                  <Button variant="outline" size="xs" disabled={isPending}>
                    {ens.data ? t("updateEns") : t("setEns")}
                  </Button>
                }
                title={ens.data ? t("updateEns") : t("setEns")}
                description={t("ensDescription")}
              >
                <div>
                  <UpsertENSForm onSuccess={ens.refetch} />
                </div>
              </ResponsiveModal>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mx-auto md:min-w-[60%] min-w-full">
          <Tabs defaultValue="profile" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">{t("title")}</TabsTrigger>
                <TabsTrigger disabled={true} value="vouchers">
                  {tNav("vouchers")}
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="profile" className="mt-0">
                {auth?.user ? (
                  <ProfileForm
                    buttonLabel={tButtons("updateProfile")}
                    isLoading={isPending}
                    initialValues={auth.user}
                    onSubmit={updateUser}
                  />
                ) : (
                  <p>{tCommon("loading")}</p>
                )}
              </TabsContent>
              <TabsContent value="vouchers" className="mt-0">
                <p>Vouchers content will go here.</p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </ContentContainer>
  );
}
