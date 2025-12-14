"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Add item...",
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Optional: Remove last tag if pressing backspace on empty input
      e.preventDefault();
      const newValue = [...value];
      newValue.pop();
      onChange(newValue);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "h-9 w-full flex flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        )}
        onClick={handleContainerClick}
      >
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex h-6 items-center gap-1 rounded-md border border-input bg-background pl-2 pr-1 text-sm font-normal text-foreground hover:bg-accent"
          >
            {tag}
            <button
              type="button"
              className="ml-1 rounded-full p-0.5 outline-none hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-0"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <X className="h-3 w-3 text-muted-foreground" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
        <div className="flex flex-1 items-center gap-2 min-w-[80px]">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          addTag();
        }}
      >
        <Plus />
        <span className="sr-only">Add to array</span>
      </Button>
    </div>
  );
}
