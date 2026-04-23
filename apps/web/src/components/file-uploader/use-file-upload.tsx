import { useState } from "react";
import { toast } from "sonner";

const useFileUpload = () => {
  const [progress, setProgress] = useState<number>(0);

  const uploadFile = (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://storage.sarafu.network/v1/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        setProgress(percentage);
      }
    };

    return new Promise<string>((resolve, reject) => {
      xhr.onerror = (e) => {
        console.error(e);
        reject(new Error("File upload failed"));
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = xhr.responseText;
          const response = JSON.parse(data) as {
            ok: boolean;
            payload: {
              s3: string;
            };
          };
          if (response.ok) {
            resolve(response.payload.s3);
          } else {
            toast.error("File upload failed");
            reject(new Error("File upload failed"));
          }
        } else {
          toast.error("File upload failed");
          reject(new Error("File upload failed"));
        }
      };

      xhr.send(formData);
    });
  };

  return {
    progress,
    uploadFile,
  };
};

export default useFileUpload;
