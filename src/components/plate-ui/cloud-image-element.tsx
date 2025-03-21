"use client";

import { cn } from "@udecode/cn";

import {
  type PlateElementProps,
  PlateElement,
  withHOC,
  withRef,
} from "@udecode/plate-common/react";

import { type TElement } from "@udecode/plate-common";
import { Image, useMediaState } from "@udecode/plate-media/react";
import { ResizableProvider, useResizableStore } from "@udecode/plate-resizable";
import { CloudImagePlugin } from "../plate/cloud-plugin/image/CloudImagePlugin";
import { useCloudImageElementState } from "../plate/cloud-plugin/image/useCloudImageElementState";
import { Caption, CaptionTextarea } from "./caption";
import { StatusBar } from "./cloud-status-bar";
import { MediaPopover } from "./media-popover";
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
    ({
      children,
      className,
      element,
      ...props
    }: PlateElementProps<TCloudImageElement>) => {
      const { align = "center", readOnly } = useMediaState();

      const width = useResizableStore().get.width() ?? 300;
      const { focused, selected, size, src, srcSet, upload } =
        useCloudImageElementState({ element });
      return (
        <MediaPopover plugin={CloudImagePlugin}>
          <PlateElement
            className={cn("relative my-4", className)}
            element={element}
            style={{ userSelect: "none" }}
            contentEditable={false}
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
