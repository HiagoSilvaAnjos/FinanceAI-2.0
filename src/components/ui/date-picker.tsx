"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
}: DatePickerProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Sincronizar valor inicial
  useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"));
    }
  }, [value]);

  // Função para formatar entrada do usuário
  const formatInput = (input: string) => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para parsear data do input
  const parseDate = (dateString: string): Date | null => {
    // Remove barras e espaços
    const cleanString = dateString.replace(/[^\d]/g, "");

    if (cleanString.length === 8) {
      const day = parseInt(cleanString.slice(0, 2));
      const month = parseInt(cleanString.slice(2, 4));
      const year = parseInt(cleanString.slice(4, 8));

      // Validação básica
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
        const date = new Date(year, month - 1, day);
        // Verificar se a data é válida (não mudou após construção)
        if (
          date.getDate() === day &&
          date.getMonth() === month - 1 &&
          date.getFullYear() === year
        ) {
          return date;
        }
      }
    }

    return null;
  };

  // Lidar com mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Se o usuário está digitando, apenas formatar visualmente
    if (rawValue.length <= 10) {
      const formatted = formatInput(rawValue);
      setInputValue(formatted);
    }
  };

  // Lidar com blur (quando o usuário sai do campo)
  const handleInputBlur = () => {
    const parsedDate = parseDate(inputValue);

    if (parsedDate) {
      // Data válida - formatar corretamente e notificar mudança
      const formattedDate = format(parsedDate, "dd/MM/yyyy");
      setInputValue(formattedDate);
      onChange?.(parsedDate);
    } else if (inputValue.trim() === "") {
      // Campo vazio - limpar
      setInputValue("");
    } else {
      // Data inválida - restaurar valor anterior ou limpar
      if (value) {
        setInputValue(format(value, "dd/MM/yyyy"));
      } else {
        setInputValue("");
      }
    }
  };

  // Lidar com teclas especiais
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir navegação e edição
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Tab" ||
      e.key === "Enter"
    ) {
      if (e.key === "Enter") {
        handleInputBlur();
      }
      return;
    }

    // Permitir apenas números e barras
    if (!/[\d/]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Lidar com seleção do calendário
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"));
      onChange?.(date);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1"
        maxLength={10}
      />

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            className="shrink-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            disabled={disabled}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
