import { useEditorRef } from "@udecode/plate-common/react";
import { CloudPlugin } from "../cloud/CloudPlugin";

/** Indicates an `Upload` that is uploading and the state of the Upload */
export type UploadProgress = {
  finishPromise: Promise<UploadError | UploadSuccess>;
  sentBytes: number;
  status: "progress";
  totalBytes: number;
  url: string;
  file?: File;
};
/** Indicates an `Upload` that has completed uploading */
export type UploadSuccess = {
  status: "success";
  url: string;
};
/**
 * Indicates an `Upload` that has an error during uploading and the Error
 * message
 */
export type UploadError = {
  message: string;
  status: "error";
  url: string;
};
/** Indicated the `Upload` could not be found. */
export type UploadStateNotFound = {
  status: "not-found";
};
export type Upload =
  | UploadError
  | UploadProgress
  | UploadStateNotFound
  | UploadSuccess;
/**
 * `UploadState`
 *
 * Types related to the `zustand` state-management library which we use to store
 * the state of uploads.
 */
type GetUpload = (id: string) => Upload;
type SetUpload = (id: string, upload: Upload) => void;
export type UploadState = {
  getUpload: GetUpload;
  setUpload: SetUpload;
  uploads: Record<string, Upload>;
};

/**
 * Takes an `element` (which it only needs for its `id`) and returns the Upload
 * object from it.
 */
export const useUpload = (id: string): Upload => {
  const editor = useEditorRef();
  const { uploadStore } = editor.getOptions(CloudPlugin);
  const upload = uploadStore.use.upload(id) || {
    status: "not-found",
  };
  if (id.includes("/")) {
    return {
      status: "success",
      url: id,
    };
  }
  return upload;
};
