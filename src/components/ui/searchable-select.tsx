"use client";

import * as React from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SearchableSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: Array<{ value: string; label: string; distance?: number | null }>;
    placeholder?: string;
    className?: string;
    showLocationPrompt?: boolean;
    onEnableLocation?: () => void;
}

export function SearchableSelect({
    value,
    onValueChange,
    options,
    placeholder = "Select an option...",
    className,
    showLocationPrompt = false,
    onEnableLocation,
}: SearchableSelectProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [open, setOpen] = React.useState(false);

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options;

        return options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery]);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className="relative w-full">
            <Select value={value} onValueChange={onValueChange} open={open} onOpenChange={setOpen}>
                <SelectTrigger className={cn("w-full h-12 text-lg", className)}>
                    <SelectValue placeholder={placeholder}>
                        {selectedOption?.label || placeholder}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <div className="flex items-center border-b px-3 pb-2 mb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-500">
                                No results found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{option.label}</span>
                                        {option.distance !== null && option.distance !== undefined && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                {Math.round(option.distance)}m
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </div>
                    {showLocationPrompt && onEnableLocation && (
                        <div className="border-t pt-2 mt-2">
                            <button
                                type="button"
                                onClick={onEnableLocation}
                                className="w-full text-sm text-blue-600 hover:text-blue-800 py-2 text-center"
                            >
                                📍 Enable Location for Nearby Groups
                            </button>
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
