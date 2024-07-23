import { UploadIcon } from "@radix-ui/react-icons";
import React, { useRef } from "react";
import { Button } from "../ui/button";

const FileInput = ({
  onSelectFile,
}: {
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        id="file-input"
        type="file"
        accept=".png, .jpg, .jpeg"
        onChange={onSelectFile}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <Button
        type="button"
        variant={"outline"}
        onClick={() => fileInputRef?.current?.click()}
        size="sm"
      >
        <UploadIcon />
      </Button>
    </div>
  );
};

export default FileInput;
