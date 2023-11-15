import { withIronSessionSsr } from "iron-session/next";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { useToast } from "~/components/ui/use-toast";
import {
  ProfileForm,
  type UserProfileFormType,
} from "~/components/users/forms/profile-form";
import { useUser } from "~/hooks/useAuth";
import { sessionOptions } from "~/lib/session";

import { api } from "~/utils/api";
export const getServerSideProps = withIronSessionSsr(({ req, res }) => {
  const user = req.session.user;

  if (user === undefined) {
    res.setHeader("location", "/");
    res.statusCode = 302;
    res.end();
    return {
      props: {},
    };
  }
  return {
    props: {},
  };
}, sessionOptions);

const WalletPage = () => {
  const { toast } = useToast();
  useUser({
    redirectOnNull: "/",
  });
  const { mutateAsync, isLoading } = api.me.update.useMutation();
  const { data: me } = api.me.get.useQuery();

  const updateUser = (values: UserProfileFormType) => {
    mutateAsync(values)
      .then(() => {
        toast({
          title: "Profile updated",
        });
      })
      .catch((err: Error) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      });
  };
  return (
    <div className="max-w-lg w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
      <div className="col-span-12">
        <div className="text-3xl font-semibold pt-4 pb-2 text-center">
          Profile
        </div>
      </div>
      <Card className="col-span-12 mt-2 max-w-md md:min-w-[60%] min-w-full">
        <div className="relative">
          <CardTitle className="m-4 text-center">Information</CardTitle>
        </div>
        <CardContent className="p-4">
          {me && (
            <ProfileForm
              buttonLabel="Update"
              isLoading={isLoading}
              initialValues={me}
              onSubmit={updateUser}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
