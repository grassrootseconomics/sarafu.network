"use client";

import { Search } from "lucide-react";
import { type InputHTMLAttributes } from "react";
import { Input } from "./input";

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Input type="text" className="pl-10" {...props} />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}
