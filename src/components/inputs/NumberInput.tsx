"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max = 1000000,
  step = 1,
  className,
}: NumberInputProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const updateValue = (newValue: number) => {
    const clamped = Math.min(Math.max(newValue, min), max);
    onChange(clamped);
  };

  const valueRef = React.useRef(value);
  valueRef.current = value;

  const startContinuousChange = (direction: "increment" | "decrement") => {
    const current = valueRef.current;
    const newValue =
      direction === "increment" ? current + step : current - step;
    updateValue(newValue);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const liveValue = valueRef.current;
        const nextValue =
          direction === "increment" ? liveValue + step : liveValue - step;
        updateValue(nextValue);
      }, 60);
    }, 400);
  };

  const stopContinuousChange = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const parsed = Number(rawValue);
    if (!isNaN(parsed)) {
      setInputValue(parsed);
      onChange(parsed);
    }
  };

  return (
    <InputGroup className={className}>
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          title="Subtract"
          size="icon-xs"
          onClick={() => {}}
          onMouseDown={() => startContinuousChange("decrement")}
          onMouseUp={stopContinuousChange}
          onMouseLeave={stopContinuousChange}
          onTouchStart={() => startContinuousChange("decrement")}
          onTouchEnd={stopContinuousChange}
          disabled={value <= min}
        >
          <Minus />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        value={inputValue}
        type="number"
        onChange={handleInputChange}
        className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          title="Add"
          size="icon-xs"
          onClick={() => {}}
          onMouseDown={() => startContinuousChange("increment")}
          onMouseUp={stopContinuousChange}
          onMouseLeave={stopContinuousChange}
          onTouchStart={() => startContinuousChange("increment")}
          onTouchEnd={stopContinuousChange}
          disabled={value >= max}
        >
          <Plus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
