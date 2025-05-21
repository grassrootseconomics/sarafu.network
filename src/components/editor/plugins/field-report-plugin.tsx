"use client";

import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate";
import { useMediaState } from "@udecode/plate-media/react";
import {
  createPlatePlugin,
  PlateEditor,
  PlateElement,
  type PlateElementProps,
  useEditorReadOnly,
  useEditorRef,
} from "@udecode/plate/react";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function insertFieldReportForm(editor: PlateEditor) {
  editor.tf.insertNode({
    type: "field-report-form",
    children: [{ text: "" }],
    formData: {
      description: "",
      hostName: "",
      participants: "",
      timeTaken: "",
    },
  });
}

export interface TFieldReportElement extends TElement {
  type: "field-report-form";
  formData: FieldReportFormData;
  children: [{ text: string }];
}
interface FieldReportFormData {
  description: string;
  hostName: string;
  participants: string;
  timeTaken: string;
}
export const FieldReportElement = withRef(
  (
    { children, element, ...props }: PlateElementProps<TFieldReportElement>,
    ref
  ) => {
    const editor = useEditorRef();
    const isReadOnly = useEditorReadOnly();
    const [formData, setFormData] = useState(
      element.formData || {
        description: "",
        hostName: "",
        participants: "",
        timeTaken: "",
      }
    );

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      field: string,
      value: string
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);
      const path = editor.api.findPath(element);
      if (path) {
        editor.tf.setNodes({ formData: newFormData }, { at: path });
      }
    };
    const { focused, selected } = useMediaState();

    if (isReadOnly) {
      return (
        <PlateElement
          className={cn("relative", "")}
          element={element}
          // @ts-expect-error - contentEditable is not defined on PlateElement
          contentEditable={false}
          ref={ref}
          {...props}
        >
          <div>
            <p className="my-2 whitespace-pre-wrap">
              {formData.description || "Not provided"}
            </p>
          </div>

          <div className="my-4 space-y-4 rounded-md border p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Host</h3>
                <p className="mt-1">{formData.hostName || "Not provided"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">
                  Participants
                </h3>
                <p className="mt-1">
                  {formData.participants || "Not provided"}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Duration</h3>
                <p className="mt-1">{formData.timeTaken || "Not provided"}</p>
              </div>
            </div>
          </div>

          {children}
        </PlateElement>
      );
    }

    return (
      <PlateElement
        className={cn("relative", "")}
        element={element}
        // @ts-expect-error - contentEditable is not defined on PlateElement
        contentEditable={false}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            "m-2 grid gap-6 rounded-md border p-6 shadow",
            focused && selected && "ring-2 ring-ring ring-offset-2"
          )}
          contentEditable={false}
        >
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange(e, "description", e.target.value)
              }
              placeholder="Detailed description of the activity..."
              disabled={isReadOnly}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hostName">Host Name</Label>
            <Input
              id="hostName"
              value={formData.hostName}
              onChange={(e) => handleInputChange(e, "hostName", e.target.value)}
              placeholder="e.g. Nyavu Ngale"
              disabled={isReadOnly}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="participants">Number of Participants</Label>
            <Input
              id="participants"
              type="number"
              value={formData.participants}
              onChange={(e) =>
                handleInputChange(e, "participants", e.target.value)
              }
              placeholder="e.g. 21"
              disabled={isReadOnly}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="timeTaken">Time Taken</Label>
            <Input
              id="timeTaken"
              value={formData.timeTaken}
              onChange={(e) =>
                handleInputChange(e, "timeTaken", e.target.value)
              }
              placeholder="e.g. 2 hours"
              disabled={isReadOnly}
            />
          </div>
        </div>
        {children}
      </PlateElement>
    );
  }
);

export const FieldReportFormPlugin = createPlatePlugin({
  key: "field-report-form",
  node: {
    component: FieldReportElement,
    isElement: true,
    isVoid: true,
  },
}).extendTransforms((api) => ({
  insertFieldReportForm: () => {
    api.tf.insertNode({
      type: "field-report-form",
      children: [{ text: "" }],
    });
  },
}));
