import type { SlateElementProps } from "platejs";

import { SlateElement } from "platejs";

export function TableRowElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="tr" className="h-full">
      {props.children}
    </SlateElement>
  );
}
