import { CheckIcon } from "lucide-react";
import * as React from "react";
import { Icons } from "./icons";

type LoadingProps = {
  success?: boolean;
  status?: string;
};

export const Loading: React.FC<LoadingProps> = ({ status, success }) => {
  return (
    <div className="flex flex-col items-center justify-center ">
      {success ? (
        <CheckIcon className="text-green-500" />
      ) : (
        <Icons.spinner className="animate-spin" />
      )}
      {status && <p className="mt-2 font-normal">{status}</p>}
    </div>
  );
};
