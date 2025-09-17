"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTH_OPTIONS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

interface TimeSelectProps {
  selectedMonth: string;
  selectedYear: string;
}

const TimeSelect = ({ selectedMonth, selectedYear }: TimeSelectProps) => {
  const { push } = useRouter();

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2024; year--) {
      years.push({ value: String(year), label: String(year) });
    }
    return years;
  };

  const handleDateChange = (type: "month" | "year", value: string) => {
    const newMonth = type === "month" ? value : selectedMonth;
    const newYear = type === "year" ? value : selectedYear;

    push(`/?month=${newMonth}&year=${newYear}`);
  };

  const yearOptions = generateYearOptions();

  return (
    <div className="flex gap-4">
      <Select
        onValueChange={(month) => handleDateChange("month", month)}
        value={selectedMonth}
      >
        <SelectTrigger className="w-[150px] rounded-full">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(year) => handleDateChange("year", year)}
        value={selectedYear}
      >
        <SelectTrigger className="w-[100px] rounded-full">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelect;
