import {type  PluginConfig } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-common/react";
import Defer from "p-defer";
import { resizeIn } from "../client";
import { CloudPlugin } from "../cloud/CloudPlugin";
import type {
  ErrorEvent$1,
  FileEvent,
  ImageFileEvent,
  ProgressEvent$1,
  SuccessEvent,
} from "../cloud/uploadFiles";
import type { UploadError, UploadSuccess } from "../upload/useUpload";

export type CloudImagePluginOptions = PluginConfig<
  "cloud_image",
  {
    maxInitialHeight: number;
    maxInitialWidth: number;
    maxResizeWidth: number;
    minResizeWidth: number;
  }
>;
export const CloudImagePlugin = createPlatePlugin({
  key: "cloud_image",
  dependencies: ["cloud"],
  node: { isElement: true, isVoid: true },
  options: {
    maxInitialHeight: 320,
    maxInitialWidth: 320,
    maxResizeWidth: 640,
    minResizeWidth: 100,
  },
}).extendApi(({ editor, getOptions }) => {
  const { uploadStore } = editor.getOptions(CloudPlugin);
  const deferredFinish = Defer();
  const finishPromise = deferredFinish.promise as Promise<
    UploadError | UploadSuccess
  >;
  return {
    onError: (e: ErrorEvent$1 & FileEvent) => {
      const upload: UploadError = {
        message: e.message,
        status: "error",
        url: e.url,
      };
      uploadStore.set.upload(e.id, upload);
      deferredFinish.resolve(upload);
    },
    onProgress: (e: FileEvent & ProgressEvent$1) => {
      console.log("onProgress", e);
      uploadStore.set.upload(e.id, {
        finishPromise,
        sentBytes: e.sentBytes,
        status: "progress",
        totalBytes: e.totalBytes,
        url: e.url,
      });
    },
    onStart: (e: ImageFileEvent) => {
      console.log("onStart", e);
      const { height, width } = resizeIn(
        { height: e.height, width: e.width },
        {
          height: getOptions().maxInitialHeight,
          width: getOptions().maxInitialWidth,
        }
      );
      const node = {
        bytes: e.file.size,
        children: [{ text: "" }],
        height,
        maxHeight: e.height,
        maxWidth: e.width,
        type: "cloud_image",
        url: e.id,
        width,
      };
      editor.insertNode(node);
      uploadStore.set.upload(e.id, {
        finishPromise,
        sentBytes: 0,
        status: "progress",
        totalBytes: e.file.size,
        url: e.url,
      });
    },
    onSuccess: (e: FileEvent & SuccessEvent) => {
      const upload: UploadSuccess = {
        status: "success",
        url: e.url,
      };
      uploadStore.set.upload(e.id, upload);
      deferredFinish.resolve(upload);
    },
  };
});
