import { CheckIcon } from "lucide-react";
import React from "react";
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

export const InfinityLoader: React.FC = () => {
  return (
    <svg
      className="block m-auto size-5"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rotated Group with Spin Animation */}
      <g transform="rotate(45 50 50)">
        <g>
          <path
            d="
              M10,50
              C10,20 40,20 50,50
              C60,80 90,80 90,50
              C90,20 60,20 50,50
              C40,80 10,80 10,50
            "
            fill="none"
            stroke="#808080"
            strokeWidth="10"
            strokeLinecap="round"
          ></path>
        </g>
        <g>
          <path
            d="
              M10,50
              C10,20 40,20 50,50
              C60,80 90,80 90,50
              C90,20 60,20 50,50
              C40,80 10,80 10,50
            "
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="100"
            filter="url(#glow) url(#shadow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="400"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  );
};
