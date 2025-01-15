/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { cn, withRef } from '@udecode/cn';
import { getMentionOnSelectItem } from '@udecode/plate-mention';
import { useState } from 'react';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';
import { PlateElement } from './plate-element';

const onSelectItem = getMentionOnSelectItem();

type MentionInputElementProps = { 
  items: {
    key: string;
    icon_url?: string | null;
    text: string;
    value: string;
  }[];
  children: React.ReactNode;
};
export const MentionInputElement = withRef<typeof PlateElement, MentionInputElementProps>(
  ({ className, ...props }, ref) => {
    const { children, editor, element, items } = props;
    const [search, setSearch] = useState('');
    return (
      <PlateElement
        ref={ref}
        as="span"
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox
          value={search}
          element={element}
          setValue={setSearch}
          showTrigger={false}
          trigger="@"
        >
          <span
            className={cn(
              'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm ring-ring focus-within:ring-2',
              className
            )}
          >
            <InlineComboboxInput />
          </span>

          <InlineComboboxContent className="my-1.5">
            <InlineComboboxEmpty>No results found</InlineComboboxEmpty>
            {items?.map((item) => (
              <InlineComboboxItem
                key={item.key}
                value={item.text}
                onClick={() => onSelectItem(editor, {text: item.value}, search)}
                className="flex items-center gap-2"
              >

                {item.icon_url && <Avatar className="h-6 w-6">
                  <AvatarImage asChild  src={item.icon_url ?? "/apple-touch-icon.png"} >
                <Image  src={item.icon_url ?? "/apple-touch-icon.png"}  alt="" width={24} height={24} />
              </AvatarImage>
                  <AvatarFallback>{item.text.slice(0, 2)}</AvatarFallback>
                </Avatar>}
                {item.text}
              </InlineComboboxItem>
            ))}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);

