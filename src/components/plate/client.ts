import { type ClientFile, createClientFile } from "./create-client-file";

type UploadBeforeFetchEvent = {
  type: "beforeFetch";
  file: File;
  clientFile: ClientFile;
};
type UploadProgressEvent = {
  type: "progress";
  file: File;
  clientFile: ClientFile;
  sentBytes: number;
  totalBytes: number;
};

type UploadSuccessEvent = {
  type: "success";
  file: File;
  clientFile: ClientFile;
  hostedFile: HostedFileInfo;
};
type UploadErrorEvent = {
  type: "error";
  file: File;
  clientFile: ClientFile;
  message: string;
};
export type HostedGenericFileInfo = {
  type: "generic";
  url: string;
};
export type HostedImageFileInfo = {
  type: "image";
  url: string;
  width: number;
  height: number;
};
export type HostedFileInfo = HostedGenericFileInfo | HostedImageFileInfo;
export type HostedGenericFile = HostedGenericFileInfo & {
  key: string;
};
export type HostedImageFile = HostedImageFileInfo & {
  key: string;
};
export type HostedFile = HostedGenericFile | HostedImageFile;
type UploadOptions = {
  file: File;
  folder: string;
  onProgress?: (event: UploadProgressEvent) => void;
  onBeforeFetch?: (event: UploadBeforeFetchEvent) => void;
  onSuccess?: (event: UploadSuccessEvent) => void;
  onError?: (event: UploadErrorEvent) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'application/pdf']

export async function uploadFileGE(options: UploadOptions): Promise<string | undefined> {
  const { folder, onProgress, onSuccess, onError, onBeforeFetch, file } = options
  const clientFile = await createClientFile(options.file);
  const beforeFetchEvent = {
    type: "beforeFetch" as const,
    file: options.file,
    clientFile,
  };
  onBeforeFetch?.(beforeFetchEvent);


    if (file.size > MAX_FILE_SIZE) {
      const errorEvent: UploadErrorEvent = {
        type: 'error',
        file,
        clientFile: await createClientFile(file),
        message: 'File size exceeds 5MB limit'
      }
      onError?.(errorEvent)
      return
    }

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      const errorEvent: UploadErrorEvent = {
        type: 'error',
        file,
        clientFile: await createClientFile(file),
        message: 'Unsupported file format. Please use JPEG, PNG or PDF'
      }
      onError?.(errorEvent)
      return
    }
  const hostedFile: HostedFileInfo =
    clientFile.type === "image"
      ? {
          type: "image",
          url: clientFile.objectUrl,
          width: clientFile.width,
          height: clientFile.height,
        }
      : { type: "generic", url: clientFile.objectUrl };

  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://storage.sarafu.africa/v1/upload");

  xhr.upload.onprogress = (event) => {
    console.log("uploading file", event);
    if (event.lengthComputable && onProgress) {
      console.log("uploading file", event);
      const sentBytes = event.loaded;
      const totalBytes = event.total;
      const progressEvent = {
        type: "progress" as const,
        file,
        clientFile,
        sentBytes: sentBytes,
        totalBytes: totalBytes,
      };
      onProgress?.(progressEvent);
    }
  };

  return new Promise((resolve, reject) => {
    xhr.onerror = (e) => {
      console.error(e);
      const errorEvent: UploadErrorEvent = {
        type: "error",
        file,
        clientFile,
        message: "File upload failed",
      };
      onError?.(errorEvent);
      console.error(errorEvent);
      reject(new Error("File upload failed"));
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = xhr.responseText;
        const response = JSON.parse(data) as {
          ok: boolean;
          payload: { s3: string };
        };
        const successEvent: UploadSuccessEvent = {
          type: "success",
          file,
          clientFile,
          hostedFile: {
            ...hostedFile,
            url: response.payload.s3,
          },
        };
        onSuccess?.(successEvent);
        if (response.ok) {
          resolve(response.payload.s3);
        } else {
          reject(new Error("File upload failed"));
        }
      } else {
        reject(new Error("File upload failed"));
      }
    };

    xhr.send(formData);
  });
}

type ImageSize = { width: number; height: number };

export function resizeIn(size: ImageSize, bounds: ImageSize): ImageSize {
  if (size.width <= 0) throw new Error(`width must be greater than 0`);
  if (size.height <= 0) throw new Error(`height must be greater than 0`);
  if (bounds.width <= 0) throw new Error(`bounds width must be greater than 0`);
  if (bounds.height <= 0)
    throw new Error(`bounds height must be greater than 0`);

  // if size is smaller than bounds leave it alone
  if (size.width < bounds.width && size.height < bounds.height) {
    return size;
  }

  const aspect = size.width / size.height;
  const boundsAspect = bounds.width / bounds.height;

  if (aspect > boundsAspect) {
    // src is wider than inside so constrain by width
    return {
      width: bounds.width,
      height: Math.max(1, Math.round(bounds.width / aspect)),
    };
  } else {
    // src is taller than inside so constrain by height
    return {
      width: Math.max(1, Math.round(bounds.height * aspect)),
      height: bounds.height,
    };
  }
}

const BIG_DIMENSION = 100000;

export const resizeInWidth = (size: ImageSize, width: number) =>
  resizeIn(size, { width, height: BIG_DIMENSION });

export const resizeInHeight = (size: ImageSize, height: number) =>
  resizeIn(size, { width: BIG_DIMENSION, height });
