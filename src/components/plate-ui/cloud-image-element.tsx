"use client";

import { cn } from "@udecode/cn";

import {
  type PlateElementProps,
  PlateElement,
  withHOC,
  withRef,
} from "@udecode/plate/react";

import { type TElement } from "@udecode/plate";
import { Image, useMediaState } from "@udecode/plate-media/react";
import { ResizableProvider, useResizableStore } from "@udecode/plate-resizable";
import { Caption, CaptionTextarea } from "~/components/ui/caption";
import { MediaPopover } from "~/components/ui/media-popover";

import { CloudImagePlugin } from "../editor/plugins/cloud-plugin/image/CloudImagePlugin";
import { useCloudImageElementState } from "../editor/plugins/cloud-plugin/image/useCloudImageElementState";
import { StatusBar } from "./cloud-status-bar";
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from "./resizable";
export interface TCloudImageElement extends TElement {
  bytes: number;
  height: number;
  maxHeight: number;
  maxWidth: number;
  url: string;
  width: number;
}

export const CloudImageElement = withHOC(
  ResizableProvider,
  withRef(
    (
      {
        children,
        className,
        element,
        ...props
      }: PlateElementProps<TCloudImageElement>,
      ref
    ) => {
      const { align = "center", readOnly } = useMediaState();

      const resizeStore = useResizableStore();
      const width = resizeStore.getWidth() ?? 300;
      const { focused, selected, size, src, srcSet, upload } =
        useCloudImageElementState({ element });
      return (
        <MediaPopover plugin={CloudImagePlugin}>
          <PlateElement
            ref={ref}
            className={cn("relative my-4", className)}
            element={element}
            style={{ userSelect: "none" }}
            {...props}
          >
            {src === "" ? (
              <div
                className={cn(
                  "block rounded-lg",
                  focused && selected && "shadow-[0_0_1px_3px_#60a5fa]"
                )}
                style={{
                  background: "#e0e0e0",
                  height: size.height,
                  width: size.width,
                }}
              />
            ) : (
              <>
                <Resizable
                  align={align}
                  options={{
                    align,
                    readOnly,
                  }}
                >
                  <ResizeHandle
                    className={mediaResizeHandleVariants({ direction: "left" })}
                    options={{ direction: "left" }}
                  />
                  <Image
                    className={cn(
                      "block w-full max-w-full cursor-pointer object-cover px-0",
                      "rounded-sm",
                      focused && selected && "ring-2 ring-ring ring-offset-2"
                    )}
                    alt=""
                    height={size.height}
                    src={src}
                    srcSet={srcSet}
                    width={size.width}
                  />
                  <ResizeHandle
                    className={mediaResizeHandleVariants({
                      direction: "right",
                    })}
                    options={{ direction: "right" }}
                  />
                </Resizable>
                <Caption style={{ width }} align={align}>
                  <CaptionTextarea
                    readOnly={readOnly}
                    placeholder="Write a caption..."
                  />
                </Caption>
              </>
            )}
            <div className="absolute inset-x-2 top-1/2 -mt-2">
              <StatusBar upload={upload} />
            </div>
            {children}
          </PlateElement>
        </MediaPopover>
      );
    }
  )
);
