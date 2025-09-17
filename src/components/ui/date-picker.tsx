"use client";

import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePikerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}

export const DatePicker = ({ value, onChange }: DatePikerProps) => {
  const [inputValue, setInputValue] = React.useState<string>(
    value
      ? new Date(value).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "",
  );

  React.useEffect(() => {
    if (value) {
      setInputValue(
        new Date(value).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      );
    }
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    const [day, month, year] = event.target.value.split("/");
    if (day && month && year) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date instanceof Date && !isNaN(date.getTime())) {
        onChange(date);
      }
    }
  };

  const handleDaySelect = (selectedDay: Date | undefined) => {
    if (selectedDay) {
      onChange(selectedDay);
      setInputValue(
        selectedDay.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      );
    }
  };

  return (
    <Popover>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="dd/mm/aaaa"
          className="pr-10"
        />
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="absolute right-[0px] top-1/2 -translate-y-1/2 p-2"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDaySelect}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
};
