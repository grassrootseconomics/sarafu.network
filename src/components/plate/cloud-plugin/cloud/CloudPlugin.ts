import type { PluginConfig, Value } from "@udecode/plate-common";
import { createTPlatePlugin } from "@udecode/plate-common/react";
import { createUploadStore } from "../upload/createUploadStore";
import type { Upload } from "../upload/useUpload";
import { finishUploads, type FinishUploadsOptions } from "./finishUploads";
import { getSaveValue } from "./getSavedValue";
import { onDropCloud, onPasteCloud } from "./handlers";
import { uploadFiles } from "./uploadFiles";

// type CloudConfig = PluginConfig<'cloud', {
//   client?: portiveClient.Client;
//   uploadStore?: ReturnType<typeof createUploadStore>;
//   uploadStoreInitialValue?: Record<string, Upload>;
// } & portiveClient.ClientOptions, {
//   cloud: {
//       finishUploads: (options?: FinishUploadsOptions) => Promise<void>;
//       getSaveValue: () => Value;
//       uploadFiles: (files: Iterable<File>) => void;
//   };
// }>;
// declare const CloudPlugin: _udecode_plate_core_react.PlatePlugin<PluginConfig<"cloud", {
//   client: portiveClient.Client;
//   uploadStore: zustand_x.StoreApi<"upload", {
//       uploads: Record<string, Upload>;
//   }, zustand_x.SetRecord<{
//       uploads: Record<string, Upload>;
//   }> & {
//       state: zustand_x.SetImmerState<{
//           uploads: Record<string, Upload>;
//       }>;
//       mergeState: zustand_x.MergeState<{
//           uploads: Record<string, Upload>;
//       }>;
//   } & {
//       upload: (id: string, upload: Upload) => void;
//   }, {
//       upload: (id: string) => Upload | undefined;
//   }>;
// } & {
//   client?: portiveClient.Client;
//   uploadStore?: ReturnType<typeof createUploadStore>;
//   uploadStoreInitialValue?: Record<string, Upload>;
// } & portiveClient.ClientOptions, {
//   cloud: {
//       finishUploads: (options?: FinishUploadsOptions) => Promise<void>;
//       getSaveValue: () => Value;
//       uploadFiles: (files: Iterable<File>) => void;
//   };
// } & Record<"cloud", {
//   finishUploads: (options?: FinishUploadsOptions) => Promise<void>;
//   getSaveValue: () => Value;
//   uploadFiles: (files: Iterable<File>) => void;
// }>, {}>>;
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
      getSaveValue: () => Value;
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
})
  .extend(({ editor, getOptions }) => {
    let client;
    const { uploadStoreInitialValue } = getOptions();
    try {
      client = null;
    } catch (error) {
      editor.api.debug.error(error, "PORTIVE_CLIENT");
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
          getOptions().uploadStore.get.uploads()
        );
      },
      uploadFiles: (files: FileList) => {
        uploadFiles(editor, files);
      },
    };
  });
