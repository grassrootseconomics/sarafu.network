import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { useEditorReadOnly } from "@udecode/plate-common/react";
import { FontColorPlugin } from "@udecode/plate-font/react";
import { ListStyleType } from "@udecode/plate-indent-list";

import { Icons, iconVariants } from "~/components/icons";
import { AlignDropdownMenu } from "~/components/plate-ui/align-dropdown-menu";
import { IndentListToolbarButton } from "~/components/plate-ui/indent-list-toolbar-button";
import { LinkToolbarButton } from "~/components/plate-ui/link-toolbar-button";

import { ColorDropdownMenu } from "./color-dropdown-menu";
import { InsertDropdownMenu } from "./insert-dropdown-menu";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { MediaDropdownMenu } from "./media-dropdown-menu";
import { ToolbarGroup } from "./toolbar";

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
            <ToolbarGroup noSeparator>
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
              <ColorDropdownMenu
                nodeType={FontColorPlugin.key}
                tooltip="Text Color"
              >
                <Icons.color className={iconVariants({ variant: "toolbar" })} />
              </ColorDropdownMenu>
            </ToolbarGroup>

            <ToolbarGroup>
              <AlignDropdownMenu />

              <IndentListToolbarButton nodeType={ListStyleType.Disc} />
              <IndentListToolbarButton nodeType={ListStyleType.Decimal} />
            </ToolbarGroup>

            <ToolbarGroup>
              <LinkToolbarButton />
              <MediaDropdownMenu />
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />
      </div>
    </div>
  );
}
