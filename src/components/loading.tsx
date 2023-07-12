import * as React from "react";
import { Icons } from "./icons";

type LoadingProps = {
  status?: string;
};

export const Loading: React.FC<LoadingProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <Icons.spinner className="animate-spin" />
      {status && <p className="mt-2 font-normal">{status}</p>}
    </div>
  );
};
