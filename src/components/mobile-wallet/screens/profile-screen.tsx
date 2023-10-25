import { ProfileForm } from "~/components/forms/profile-form";

export const ProfileScreen = () => {
  return (
    <div>
      <div className="text-3xl font-semibold pt-4 pb-2 text-center">
        Profile
      </div>
      <div className="p-4">
        <ProfileForm />
      </div>
    </div>
  );
};
