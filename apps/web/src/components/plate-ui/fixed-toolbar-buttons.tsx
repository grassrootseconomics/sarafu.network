import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { useEditorReadOnly } from "platejs/react";

import { Icons } from "~/components/icons";
import { AlignDropdownMenu } from "~/components/ui/align-dropdown-menu";
import {
  BulletedIndentListToolbarButton,
  NumberedIndentListToolbarButton,
} from "~/components/ui/indent-list-toolbar-button";
import { LinkToolbarButton } from "~/components/ui/link-toolbar-button";

import { MediaDropdownMenu } from "~/components/plate-ui/media-dropdown-menu";
import { ReportDropdownMenu } from "~/components/plate-ui/report-dropdown-menu";
import { InsertDropdownMenu } from "~/components/ui/insert-dropdown-menu";
import { MarkToolbarButton } from "~/components/ui/mark-toolbar-button";
import { ToolbarGroup } from "~/components/ui/toolbar";

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: "translateX(calc(-1px))",
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup>
              <InsertDropdownMenu />
            </ToolbarGroup>

            <ToolbarGroup>
              <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={ItalicPlugin.key}
                tooltip="Italic (⌘+I)"
              >
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={UnderlinePlugin.key}
                tooltip="Underline (⌘+U)"
              >
                <Icons.underline />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={StrikethroughPlugin.key}
                tooltip="Strikethrough (⌘+⇧+M)"
              >
                <Icons.strikethrough />
              </MarkToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup>
              <AlignDropdownMenu />
              <BulletedIndentListToolbarButton />
              <NumberedIndentListToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <LinkToolbarButton />
              <MediaDropdownMenu />
              <ReportDropdownMenu />
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />
      </div>
    </div>
  );
}
