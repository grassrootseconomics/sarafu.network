import type {
  SlateElementProps,
  TCaptionElement,
  TTextAlignProps,
  TVideoElement,
} from "platejs";

import { NodeApi, SlateElement } from "platejs";

export function MediaVideoElementStatic(
  props: SlateElementProps<TVideoElement & TCaptionElement & { width: number }>
) {
  const { align = "center", caption, url, width } = props.element;

  return (
    <SlateElement className="py-2.5" {...props}>
      <div style={{ textAlign: align as TTextAlignProps["align"] }}>
        <figure
          className="group relative m-0 inline-block cursor-default"
          style={{ width }}
        >
          <video
            className="w-full max-w-full rounded-sm object-cover px-0"
            src={url}
            controls
          />
          {caption && (
            <figcaption>
              {caption?.[0] && NodeApi.string(caption?.[0])}
            </figcaption>
          )}
        </figure>
      </div>
      {props.children}
    </SlateElement>
  );
}
