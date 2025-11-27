import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface Option {
    value: string
    label: string
}

interface FormToggleGroupProps {
    value: string
    onValueChange: (value: string) => void
    options: Option[] | string[]
    className?: string
}

export function FormToggleGroup({
    value,
    onValueChange,
    options,
    className,
}: FormToggleGroupProps) {
    // Normalize options to object format
    const normalizedOptions = options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    )

    return (
        <ToggleGroup
            type="single"
            value={value}
            onValueChange={onValueChange}
            className={cn("flex flex-wrap justify-start gap-3", className)}
        >
            {normalizedOptions.map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-12 px-6 text-base border border-gray-200 rounded-full data-[state=on]:bg-black data-[state=on]:text-white hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    )
}
