import type { TTableElement } from "platejs";
import type { SlateElementProps } from "platejs";

import { BaseTablePlugin } from "@platejs/table";
import { SlateElement } from "platejs";

export function TableElementStatic({
  children,
  ...props
}: SlateElementProps<TTableElement>) {
  const { disableMarginLeft } = props.editor.getOptions(BaseTablePlugin);
  const marginLeft = disableMarginLeft ? 0 : props.element.marginLeft;

  return (
    <SlateElement
      {...props}
      className="overflow-x-auto py-5"
      style={{ paddingLeft: marginLeft }}
    >
      <div className="group/table relative w-fit">
        <table className="mr-0 ml-px table h-px table-fixed border-collapse">
          <tbody className="min-w-full">{children}</tbody>
        </table>
      </div>
    </SlateElement>
  );
}
