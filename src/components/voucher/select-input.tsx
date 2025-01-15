"use client";

import { ChevronDown, Search, X } from "lucide-react";
import Image from "next/image";
import React, {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useDebounce } from "~/hooks/use-debounce";
import { cn } from "~/lib/utils";
import { Loading } from "../loading";
import { ResponsiveModal } from "../modal";

function Select<TItem, TValue>(props: SelectProps<TItem, TValue>) {
  const {
    items,
    value,
    onChange,
    mode = "single",
    getItemKey,
    getItemLabel,
    getItemValue,
    getItemIcon,
    filterItem,
    className,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    title = "Select an item",
    loadingText = "Loading items...",
    noItemsText = "No items found.",
    doneButtonText = "Done",
    renderItem,
    classNames,
    onCreate,
    createItemLabel,
  } = props;

  const [open, setOpen] = useState(false);
  const [creatingItem, setCreatingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const selected =
    mode === "multi"
      ? items?.filter((item) =>
          (value as TValue[])?.includes(getItemValue(item))
        )
      : items?.find((item) => getItemValue(item) === value);

  const selectedItems: TItem[] =
    mode === "multi" ? (selected as TItem[]) || [] : [];
  const selectedItem: TItem | undefined =
    mode === "single" ? (selected as TItem | undefined) : undefined;

  const filteredItems = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (!items) return [];
    return items.filter((item) =>
      filterItem
        ? filterItem(item, query)
        : getItemLabel(item).toLowerCase().includes(query)
    );
  }, [items, debouncedSearchQuery, filterItem, getItemLabel]);

  const isExactMatch = filteredItems.some(
    (item) =>
      getItemLabel(item).toLowerCase() === debouncedSearchQuery.toLowerCase()
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!open) return;

    const currentIndex = itemRefs.current.findIndex(
      (ref) => ref === document.activeElement
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % filteredItems.length;
      itemRefs.current[nextIndex]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        (currentIndex - 1 + filteredItems.length) % filteredItems.length;
      itemRefs.current[prevIndex]?.focus();
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (
      event.key === "Enter" &&
      currentIndex >= 0 &&
      filteredItems[currentIndex]
    ) {
      handleItemSelect(filteredItems[currentIndex]);
    }
  }

  if (!items) {
    return <div className="text-center text-gray-500">{loadingText}</div>;
  }

  async function handleCreateItem() {
    if (!onCreate) return;

    setCreatingItem(true);
    try {
      const newItem = await onCreate(debouncedSearchQuery);
      if (mode === "multi") {
        const newSelectedItems = [
          ...(value as TValue[]),
          getItemValue(newItem),
        ];
        onChange?.(newSelectedItems);
      } else {
        onChange?.(getItemValue(newItem));
        setOpen(false);
      }
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setCreatingItem(false);
    }
  }

  function handleItemSelect(item: TItem) {
    if (mode === "multi") {
      const currentValues = (value as TValue[]) || [];
      let newSelectedItems: TValue[];

      if (currentValues.includes(getItemValue(item))) {
        // Item is already selected, so deselect it
        newSelectedItems = currentValues.filter(
          (v) => v !== getItemValue(item)
        );
      } else {
        // Add item to selection
        newSelectedItems = [...currentValues, getItemValue(item)];
      }
      onChange?.(newSelectedItems);
    } else {
      onChange?.(getItemValue(item));
      setOpen(false);
    }
  }

  const defaultCreateItemLabel = (query: string) => `Create "${query}"`;

  return (
    <div onKeyDown={handleKeyDown}>
      <ResponsiveModal
        open={open}
        onOpenChange={setOpen}
        button={
          <DialogTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between text-left font-normal h-fit",
                className,
                classNames?.button
              )}
            >
              {mode === "multi" ? (
                (value as TValue[])?.length ? (
                  <span className="flex flex-wrap gap-2 truncate">
                    {selectedItems.map((item) => (
                      <span
                        key={getItemKey(item)}
                        className="flex items-center gap-2 bg-primary/10 rounded-md px-2 py-1"
                      >
                        {getItemIcon && (
                          <Image
                            src={getItemIcon(item) ?? "/apple-touch-icon.png"}
                            alt={`${getItemLabel(item)} icon`}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <span className="truncate">{getItemLabel(item)}</span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemSelect(item);
                          }}
                        >
                          <X className="h-4 w-4 shrink-0" />
                        </Button>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )
              ) : (
                <span className="flex items-center gap-2 truncate">
                  {selectedItem ? (
                    <>
                      {getItemIcon && (
                        <Image
                          src={
                            getItemIcon(selectedItem) ?? "/apple-touch-icon.png"
                          }
                          alt={`${getItemLabel(selectedItem)} icon`}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full"
                        />
                      )}
                      <span className="truncate">
                        {getItemLabel(selectedItem)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )}
                </span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DialogTrigger>
        }
        title={title}
      >
        <div className="grid gap-4 py-4">
          <div className="relative px-1">
            <Search
              className="absolute left-3 z-[1] top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              aria-label={searchPlaceholder}
            />
          </div>
          <ScrollArea className="h-[300px] rounded-md p-0 border">
            {filteredItems.length === 0 && (!onCreate || isExactMatch) ? (
              <p className="text-center text-sm text-muted-foreground">
                {noItemsText}
              </p>
            ) : (
              <>
                {filteredItems.map((item, index) => (
                  <Item
                    key={getItemKey(item)}
                    item={item}
                    selectedItem={selectedItem}
                    selectedItems={selectedItems}
                    onSelect={handleItemSelect}
                    mode={mode}
                    getItemKey={getItemKey}
                    getItemLabel={getItemLabel}
                    getItemIcon={getItemIcon}
                    ref={(el) => {
                      if (el) {
                        itemRefs.current[index] = el;
                      }
                    }}
                    renderItem={renderItem}
                    className={classNames?.item}
                  />
                ))}
                {onCreate && !isExactMatch && debouncedSearchQuery && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left font-normal"
                    onClick={handleCreateItem}
                  >
                    {creatingItem ? (
                      <Loading />
                    ) : createItemLabel ? (
                      createItemLabel(debouncedSearchQuery)
                    ) : (
                      defaultCreateItemLabel(debouncedSearchQuery)
                    )}
                  </Button>
                )}
              </>
            )}
          </ScrollArea>
          {mode === "multi" && (
            <Button onClick={() => setOpen(false)} className="mt-4">
              {doneButtonText}
            </Button>
          )}
        </div>
      </ResponsiveModal>
    </div>
  );
}
// Typescript forwardRef hack
function ItemInner<TItem>(
  props: ItemProps<TItem>,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const {
    item,
    selectedItem,
    selectedItems,
    onSelect,
    mode,
    getItemKey,
    getItemLabel,
    getItemIcon,
    renderItem,
    className,
  } = props;

  let isSelected = false;
  if (mode === "multi") {
    isSelected =
      selectedItems?.some((i) => getItemKey(i) === getItemKey(item)) ?? false;
  } else {
    isSelected = selectedItem
      ? getItemKey(selectedItem) === getItemKey(item)
      : false;
  }
  function handleSelect() {
    onSelect(item);
  }
  if (renderItem) {
    return (
      <div
        key={getItemKey(item)}
        onClick={handleSelect}
        className={cn(
          "cursor-pointer w-full",
          isSelected && "bg-primary/10",
          className
        )}
        role="option"
        aria-selected={isSelected}
        ref={ref as React.Ref<HTMLDivElement>}
      >
        {renderItem(item, isSelected)}
      </div>
    );
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "w-full justify-start text-left font-normal",
        isSelected && "bg-primary/10",
        className
      )}
      onClick={handleSelect}
      aria-selected={isSelected}
      role="option"
    >
      <span className="flex w-full items-center gap-3">
        {getItemIcon && (
          <Image
            src={getItemIcon(item) ?? "/apple-touch-icon.png"}
            alt={`${getItemLabel(item)} icon`}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        )}
        <span className="flex-grow truncate">{getItemLabel(item)}</span>
      </span>
    </Button>
  );
}
// Interfaces
const Item = forwardRef(ItemInner) as <T>(
  props: ItemProps<T> & { ref?: ForwardedRef<HTMLButtonElement> }
) => ReturnType<typeof ItemInner>;

interface SelectProps<TItem, TValue> {
  items?: TItem[];
  value?: TValue[] | TValue | null;
  getItemValue: (item: TItem) => TValue;
  onChange: (value: TValue[] | TValue) => void;
  mode?: "single" | "multi";
  getItemKey: (item: TItem) => string;
  getItemLabel: (item: TItem) => string;
  getItemIcon?: (item: TItem) => string | null;
  filterItem?: (item: TItem, query: string) => boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  title?: string;
  loadingText?: string;
  noItemsText?: string;
  doneButtonText?: string;
  renderItem?: (item: TItem, isSelected: boolean) => React.ReactNode;
  classNames?: {
    container?: string;
    button?: string;
    item?: string;
  };
  onCreate?: (query: string) => Promise<TItem>;
  createItemLabel?: (query: string) => string;
}

interface ItemProps<TItem> {
  item: TItem;
  selectedItem?: TItem | null;
  selectedItems?: TItem[];
  onSelect: (item: TItem) => void;
  mode: "single" | "multi";
  getItemKey: (item: TItem) => string;
  getItemLabel: (item: TItem) => string;
  getItemIcon?: (item: TItem) => string | null;
  renderItem?: (item: TItem, isSelected: boolean) => React.ReactNode;
  className?: string;
}

export { Select };
