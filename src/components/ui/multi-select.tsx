"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
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
            selected.filter((_, index) => index !== selected.length - 1)
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

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className={className}>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            className={`group w-full justify-between ${
              selected.length > 1 ? "h-fit" : "h-10"
            }`}
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-wrap items-center gap-1">
              {selected.map((item) => (
                <Badge
                  variant="outline"
                  key={item}
                  className="flex items-center gap-1 group-hover:bg-background"
                >
                  {options.find((o) => o.value === item)?.label}
                  {open && (
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className={`border-none duration-300 ${
                        open ? "opacity-100 ease-in" : "opacity-0 ease-out"
                      }`}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter") {
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
                    </Button>
                  )}
                </Badge>
              ))}
              {selected.length === 0 && (
                <span>{props.placeholder ?? "Select ..."}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
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
                          : [...selected, option.value]
                      );
                      setOpen(true);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.some((item) => item === option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
