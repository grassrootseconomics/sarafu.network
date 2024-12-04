import { withRef } from "@udecode/cn";
import { EmojiInlineIndexSearch, insertEmoji } from "@udecode/plate-emoji";
import { useMemo, useState } from "react";

import { useDebounce } from "~/hooks/use-debounce";

import { type PlateElementProps } from "@udecode/plate-common/react";
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";
import { PlateElement } from "./plate-element";

interface EmojiInputElementProps extends PlateElementProps {
  children: React.ReactNode;
}

export const EmojiInputElement = withRef<typeof PlateElement>(
  ({ className: _className, ...props }, ref) => {
    const { children, editor, element } = props as EmojiInputElementProps;
    const [value, setValue] = useState("");
    const debouncedValue = useDebounce(value, 100);
    const isPending = value !== debouncedValue;

    const filteredEmojis = useMemo(() => {
      if (debouncedValue.trim().length === 0) return [];

      return EmojiInlineIndexSearch.getInstance()
        .search(debouncedValue.replace(/:$/, ""))
        .get();
    }, [debouncedValue]);

    return (
      <PlateElement
        ref={ref}
        as="span"
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox
          value={value}
          element={element}
          filter={false}
          setValue={setValue}
          trigger=":"
          hideWhenNoValue
        >
          <InlineComboboxInput />

          <InlineComboboxContent>
            {!isPending && (
              <InlineComboboxEmpty>No matching emoji found</InlineComboboxEmpty>
            )}

            {filteredEmojis.map((emoji) => (
              <InlineComboboxItem
                key={emoji.id}
                value={emoji.name}
                onClick={() => insertEmoji(editor, emoji)}
              >
                {emoji.skins?.[0]?.native} {emoji.name}
              </InlineComboboxItem>
            ))}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);
