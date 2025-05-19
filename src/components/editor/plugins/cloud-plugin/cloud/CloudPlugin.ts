import { type PluginConfig } from "@udecode/plate";
import { createTPlatePlugin } from "@udecode/plate/react";
import { createUploadStore } from "../upload/createUploadStore";
import type { Upload } from "../upload/useUpload";
import { finishUploads, type FinishUploadsOptions } from "./finishUploads";
import { getSaveValue } from "./getSavedValue";
import { onDropCloud, onPasteCloud } from "./handlers";
import { uploadFiles } from "./uploadFiles";

type ClientOptions = {
  apiKey?: string;
  apiOrigin?: string;
  authToken?: string;
};

type CloudConfig = PluginConfig<
  "cloud",
  {
    client?: unknown;
    uploadStore?: ReturnType<typeof createUploadStore>;
    uploadStoreInitialValue?: Record<string, Upload>;
  } & ClientOptions,
  {
    cloud: {
      finishUploads: (options?: FinishUploadsOptions) => Promise<void>;
      getSaveValue: () => unknown;
      uploadFiles: (files: Iterable<File>) => void;
    };
  }
>;
export const CloudPlugin = createTPlatePlugin<CloudConfig>({
  key: "cloud",
  options: {},
  handlers: {
    onDrop: ({ editor, event }) => onDropCloud(editor, event),
    onPaste: ({ editor, event }) => onPasteCloud(editor, event),
  },
  selectors: {},
})
  .extend(({ editor, getOptions }) => {
    let client;
    const { uploadStoreInitialValue } = getOptions();
    try {
      client = null;
    } catch (error) {
      editor.api.debug.error(error, "UPLOAD_CLIENT");
    }
    return {
      options: {
        client,
        uploadStore: createUploadStore({
          uploads: uploadStoreInitialValue || {},
        }),
      },
    };
  })
  .extendApi(({ editor, getOptions }) => {
    return {
      finishUploads: async (options: FinishUploadsOptions) => {
        return finishUploads(editor, options);
      },
      getSaveValue: () => {
        return getSaveValue(
          editor.children,
          getOptions().uploadStore.get("uploads")
        );
      },
      uploadFiles: (files: FileList) => {
        uploadFiles(editor, files);
      },
    };
  });
