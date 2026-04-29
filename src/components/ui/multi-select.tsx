"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
import { useMediaQuery } from "~/hooks/use-media-query";
import { useMounted } from "~/hooks/use-mounted";
import { cn } from "~/lib/utils";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export type OptionType = Record<"value" | "label", string>;

interface MultiSelectProps {
  options: Record<"value" | "label", string>[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onChange, className, disabled, ...props }, ref) => {
    const mounted = useMounted();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState<string>("");

    const handleUnselect = (value: string) => {
      onChange(selected.filter((i) => i !== value));
    };

    // on delete key press, remove last selected item
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Backspace" && query === "" && selected.length > 0) {
          onChange(
            selected.filter((_, index) => index !== selected.length - 1),
          );
        }

        // close on escape
        if (e.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [onChange, query, selected]);

    const placeholder = props.placeholder ?? "Select ...";

    const trigger = (
      <Button
        ref={ref}
        variant="outline"
        role="combobox"
        disabled={disabled}
        aria-expanded={open}
        className={`group w-full justify-between ${
          selected.length > 1 ? "h-fit" : "h-10"
        }`}
      >
        <div className="flex flex-wrap items-center gap-1">
          {selected.map((item) => (
            <Badge
              variant="outline"
              key={item}
              className="flex items-center gap-1 group-hover:bg-background"
            >
              {options.find((o) => o.value === item)?.label}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${
                  options.find((o) => o.value === item)?.label ?? item
                }`}
                className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnselect(item);
                  }
                }}
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnselect(item);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </span>
            </Badge>
          ))}
          {selected.length === 0 && <span>{placeholder}</span>}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );

    const list = (
      <Command className={className}>
        <CommandInput
          onValueChange={(item) => {
            setQuery(item);
          }}
          placeholder="Search ..."
        />
        <CommandList>
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(
                    selected.some((item) => item === option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value],
                  );
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.some((item) => item === option.value)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );

    // Render Popover during SSR/hydration for stable markup; switch to a
    // bottom drawer on mobile after mount (mirrors ResponsiveModal).
    if (!mounted || isDesktop) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className={className}>
            {trigger}
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">{list}</PopoverContent>
        </Popover>
      );
    }

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild className={className}>
          {trigger}
        </DrawerTrigger>
        <DrawerContent className="p-2">
          <DrawerHeader className="text-left">
            <DrawerTitle>{placeholder}</DrawerTitle>
            <DrawerDescription className="sr-only">
              Select one or more options
            </DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[70svh] overflow-y-auto">{list}</div>
        </DrawerContent>
      </Drawer>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
