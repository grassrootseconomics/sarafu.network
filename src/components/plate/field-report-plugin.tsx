"use client";

import { cn } from "@udecode/cn";
import {
  insertElements,
  setNodes,
  type TEditor,
  type TElement,
  type Value,
} from "@udecode/plate-common";
import {
  createPlatePlugin,
  findNodePath,
  PlateElement,
  type PlateElementProps,
  useEditorReadOnly,
  useEditorRef,
  withRef,
} from "@udecode/plate-common/react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function insertFieldReportForm(editor: TEditor<Value>) {
  insertElements(editor, {
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
  ({ children, element, ...props }: PlateElementProps<TFieldReportElement>) => {
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

    const handleInputChange = (field: string, value: string) => {
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);

      const path = findNodePath(editor, element);
      setNodes(editor, { formData: newFormData }, { at: path });
    };

    if (isReadOnly) {
      return (
        <PlateElement
          className={cn("relative", "")}
          element={element}
          contentEditable={false}
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
        contentEditable={false}
        {...props}
      >
        <div className="mt-2 grid gap-6 rounded-md border p-6 shadow">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detailed description of the activity..."
              disabled={isReadOnly}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hostName">Host Name</Label>
            <Input
              id="hostName"
              value={formData.hostName}
              onChange={(e) => handleInputChange("hostName", e.target.value)}
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
                handleInputChange("participants", e.target.value)
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
              onChange={(e) => handleInputChange("timeTaken", e.target.value)}
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
});
