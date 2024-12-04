/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { withRef } from "@udecode/cn";
import { useExcalidrawElement } from "@udecode/plate-excalidraw/react";

import { PlateElement } from "./plate-element";

export const ExcalidrawElement = withRef<typeof PlateElement>(
  ({ nodeProps, ...props }, ref) => {
    const { children, element } = props;

    const { Excalidraw, excalidrawProps } = useExcalidrawElement({
      element,
    });

    return (
      <PlateElement ref={ref} {...props}>
        <div contentEditable={false}>
          <div className="h-[600px]">
            {Excalidraw && <Excalidraw {...nodeProps} {...excalidrawProps} />}
          </div>
        </div>
        {children}
      </PlateElement>
    );
  }
);
