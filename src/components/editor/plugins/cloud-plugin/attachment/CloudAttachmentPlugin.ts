import { createPlatePlugin } from "@udecode/plate/react";
import Defer from "p-defer";
import { CloudPlugin } from "../cloud/CloudPlugin";
import type {
  ErrorEvent$1,
  FileEvent,
  ProgressEvent$1,
  SuccessEvent,
} from "../cloud/uploadFiles";
import type {
  UploadError,
  UploadProgress,
  UploadSuccess,
} from "../upload/useUpload";

export const CloudAttachmentPlugin = createPlatePlugin({
  key: "cloud_attachment",
  dependencies: ["cloud"],
  node: { isElement: true, isVoid: true },
}).extendApi(({ editor }) => {
  const { uploadStore } = editor.getOptions(CloudPlugin);
  const deferredFinish = Defer<UploadError | UploadSuccess>();
  const finishPromise = deferredFinish.promise;
  return {
    onError(e: ErrorEvent$1 & FileEvent) {
      const upload: UploadError = {
        message: e.message,
        status: "error",
        url: e.url,
      };
      uploadStore.actions.upload(e.id, upload);
      deferredFinish.resolve(upload);
    },
    onProgress(e: FileEvent & ProgressEvent$1) {
      const progress: UploadProgress = {
        finishPromise,
        sentBytes: e.sentBytes,
        status: "progress",
        totalBytes: e.totalBytes,
        url: e.url,
      };
      uploadStore.actions.upload(e.id, progress);
    },
    onStart(e: FileEvent) {
      const node = {
        bytes: e.file.size,
        children: [{ text: "" }],
        filename: e.file.name,
        type: "cloud_attachment",
        url: e.id,
      };
      editor.tf.insertNode(node);
      const progress: UploadProgress = {
        finishPromise,
        sentBytes: 0,
        status: "progress",
        totalBytes: e.file.size,
        url: e.url,
      };
      uploadStore.actions.upload(e.id, progress);
    },
    onSuccess(e: FileEvent & SuccessEvent) {
      const upload: UploadSuccess = {
        status: "success",
        url: e.url,
      };
      uploadStore.actions.upload(e.id, upload);
      deferredFinish.resolve(upload);
    },
  };
});
