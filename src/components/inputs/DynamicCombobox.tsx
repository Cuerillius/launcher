import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DynamicComboBoxProps<T> {
  items: T[];
  selectedItem: T | null;
  isLoading: boolean;

  onSearch: (query: string) => void;
  onSelect: (item: T) => void;

  getItemValue: (item: T) => string | number;
  getItemLabel: (item: T) => string;

  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function DynamicComboBox<T>({
  items,
  selectedItem,
  isLoading,
  onSearch,
  onSelect,
  getItemValue,
  getItemLabel,
  placeholder = "Search...",
  emptyText = "No results found.",
  className,
}: DynamicComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // KEPT: 'w-full' so it stretches to fit the container
          // REMOVED: Hardcoded dark theme colors
          className={cn("w-full justify-between", className)}
        >
          {selectedItem ? getItemLabel(selectedItem) : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        className="p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={handleSearch}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && items.length === 0 && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}

            {!isLoading && items.length > 0 && (
              <CommandGroup>
                {items.map((item) => {
                  const isSelected =
                    selectedItem &&
                    getItemValue(selectedItem) === getItemValue(item);

                  return (
                    <CommandItem
                      key={getItemValue(item)}
                      value={getItemLabel(item)}
                      onSelect={() => handleSelect(item)}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {getItemLabel(item)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
