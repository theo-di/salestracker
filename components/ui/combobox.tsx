"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ComboboxItem {
  value: string
  label: string
  [key: string]: any
}

interface ComboboxProps {
  items: ComboboxItem[]
  placeholder?: string
  emptyMessage?: string
  onSelect: (value: string) => void
  value?: string
  className?: string
}

export function Combobox({
  items,
  placeholder = "검색...",
  emptyMessage = "결과가 없습니다.",
  onSelect,
  value,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const handleSelect = (currentValue: string) => {
    setSelectedValue(currentValue === selectedValue ? "" : currentValue)
    onSelect(currentValue === selectedValue ? "" : currentValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedValue ? items.find((item) => item.value === selectedValue)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {items.map((item) => (
                <CommandItem key={item.value} value={item.value} onSelect={handleSelect}>
                  <Check className={cn("mr-2 h-4 w-4", selectedValue === item.value ? "opacity-100" : "opacity-0")} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
