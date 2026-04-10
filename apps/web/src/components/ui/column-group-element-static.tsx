import type { SlateElementProps } from "platejs";

import { SlateElement } from "platejs";

export function ColumnGroupElementStatic(props: SlateElementProps) {
  return (
    <SlateElement className="mb-2" {...props}>
      <div className="flex size-full rounded">{props.children}</div>
    </SlateElement>
  );
}
