import { createZustandStore } from "@udecode/plate";
import { type Upload } from "./useUpload";

/**
 * Creates an origin store using `zustood`.
 *
 * The purpose of this is to keep track of uploads and their progress but only
 * storing the key to the lookup in the Element itself. We do it this way
 * because we don't want to modify the Editor value during the upload or it
 * becomes part of the edit history.
 */
export const createUploadStore = ({ uploads: initialUploads = {} } = {}) => {
  const store = createZustandStore(
    {
      uploads: initialUploads,
    },
    {
      devtools: { enabled: true }, // Redux DevTools with options
      mutative: true, // shorthand for { enabled: true }
      name: "uploads",
    }
  );
  const extendedStore = store
    .extendSelectors(({ get }) => ({
      upload: (id: string) => {
        const uploads = get("uploads") as Record<string, Upload>;
        return uploads[id];
      },
    }))
    .extendActions(({ set, get }) => ({
      upload: (id: string, upload: Upload) => {
        const uploads = get("uploads") as Record<string, Upload>;
        set("uploads", { ...uploads, [id]: upload });
      },
    }));
  return extendedStore;
};
