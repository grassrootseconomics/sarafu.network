import { nanoid } from "@udecode/plate-common";

import { type PlateEditor } from "@udecode/plate-common/react";
import { CloudAttachmentPlugin } from "../attachment/CloudAttachmentPlugin";
import { uploadFileGE } from "../client";
import { type ClientFile } from "../create-client-file";
import { CloudImagePlugin } from "../image/CloudImagePlugin";
/**
 * The part of the FileEvent shared between the GenericFileEvent and the
 * ImageFileEvent.
 */
type FileEventBase = {
  id: string;
  file: File;
  url: string;
};
/** FileEvent for files that are not images */
type GenericFileEvent = {
  type: "generic";
} & FileEventBase;
/** FileEvent for files that are images */
export type ImageFileEvent = {
  height: number;
  type: "image";
  width: number;
} & FileEventBase;
/** FileEvent for any type of file (generic or image) */
export type FileEvent = GenericFileEvent | ImageFileEvent;
/** Indicates upload in progress */
export type ProgressEvent$1 = {
  sentBytes: number;
  totalBytes: number;
};
/** Indicates an error during upload */
export type ErrorEvent$1 = {
  message: string;
};
/** Indicates a successful upload */
export type SuccessEvent = {
  url: string;
};

export const createFileEvent = (id: string, clientFile: ClientFile) => {
  if (clientFile.type === "image") {
    return {
      id,
      file: clientFile.file,
      height: clientFile.height,
      type: "image" as const,
      url: clientFile.objectUrl,
      width: clientFile.width,
    };
  }
  return {
    id,
    file: clientFile.file,
    type: "generic" as const,
    url: clientFile.objectUrl,
  };
};
export const uploadFile = (editor: PlateEditor, file: File) => {
  // const { client } = editor.getOptions(CloudPlugin);
  const apiImage = editor.getApi(CloudImagePlugin);
  const apiAttachment = editor.getApi(CloudAttachmentPlugin);
  const id = `#${nanoid()}`;

  void uploadFileGE({
    file,
    folder: "plate",
    onBeforeFetch(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === "image") {
        const cloudImage = apiImage.cloud_image;
        cloudImage?.onStart?.call(cloudImage, fileEvent as ImageFileEvent);
      } else {
        const cloudAttachment = apiAttachment.cloud_attachment;
        cloudAttachment?.onStart?.call(
          cloudAttachment,
          fileEvent as GenericFileEvent
        );
      }
    },
    onError(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const errorEvent = { ...fileEvent, message: e.message };

      if (fileEvent.type === "image") {
        const cloudImage = apiImage.cloud_image;
        cloudImage?.onError?.call(
          cloudImage,
          errorEvent as ErrorEvent$1 & ImageFileEvent
        );
      } else {
        const cloudAttachment = apiAttachment.cloud_attachment;
        cloudAttachment?.onError?.call(
          cloudAttachment,
          errorEvent as ErrorEvent$1 & GenericFileEvent
        );
      }
    },

    onProgress(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const progressEvent = {
        ...fileEvent,
        sentBytes: e.sentBytes,
        totalBytes: e.totalBytes,
      };

      if (fileEvent.type === "image") {
        const cloudImage = apiImage.cloud_image;
        cloudImage?.onProgress?.call(
          cloudImage,
          progressEvent as ProgressEvent$1 & ImageFileEvent
        );
      } else {
        const cloudAttachment = apiAttachment.cloud_attachment;
        cloudAttachment?.onProgress?.call(
          cloudAttachment,
          progressEvent as ProgressEvent$1 & GenericFileEvent
        );
      }
    },

    onSuccess(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const { url } = e.hostedFile;
      const successEvent = { ...fileEvent, url };

      if (fileEvent.type === "image") {
        const cloudImage = apiImage.cloud_image;
        cloudImage?.onSuccess?.call(
          cloudImage,
          successEvent as FileEvent & SuccessEvent
        );
      } else {
        const cloudAttachment = apiAttachment.cloud_attachment;
        cloudAttachment?.onSuccess?.call(
          cloudAttachment,
          successEvent as FileEvent & SuccessEvent
        );
      }
    },
  });
};

export const uploadFiles = (editor: PlateEditor, files: FileList) => {
  for (const file of files) {
    uploadFile(editor, file);
  }
};
