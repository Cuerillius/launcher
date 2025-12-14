import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EnumValues<T> = T[keyof T];

interface SelectEnumProps<T extends Record<string, string | number>> {
  value: EnumValues<T>;
  label?: string;
  placeholder?: string;
  enum: T;
  className?: string;
  onValueChange?: (value: EnumValues<T>) => void;
  defaultValue?: EnumValues<T>;
}

export function SelectEnum<T extends Record<string, string | number>>({
  value,
  label = "Choose an option",
  placeholder = "Select an item",
  enum: enumData,
  onValueChange,
  defaultValue,
}: SelectEnumProps<T>) {
  const items = Object.keys(enumData)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key.replace(/([A-Z])/g, " $1").trim(),
      value: enumData[key] as string | number,
    }));

  const handleValueChange = (val: string) => {
    if (!onValueChange) return;

    const isNumericEnum =
      items.length > 0 && typeof items[0].value === "number";

    if (isNumericEnum) {
      onValueChange(Number(val) as EnumValues<T>);
    } else {
      onValueChange(val as EnumValues<T>);
    }
  };

  return (
    <Select
      onValueChange={handleValueChange}
      value={value ? String(value) : undefined}
      defaultValue={defaultValue ? String(defaultValue) : undefined}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items.map((item) => (
            <SelectItem key={String(item.value)} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
