import { useState, useRef, useEffect, useMemo } from "react";
import { COUNTRIES } from "../../utils/countries";
import type { Country } from "../../utils/countries";
import { ChevronDown, Search, X } from "lucide-react";

interface SearchableCountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type: "nationality" | "country";
  disabled?: boolean;
  className?: string;
}

// Pre-compute lowercase search fields once to avoid per-keystroke allocations
const SEARCH_INDEX = COUNTRIES.map((c) => ({
  country: c,
  lower: `${c.name}\t${c.nationality}\t${c.code}\t${c.phoneCode}`.toLowerCase(),
}));

export default function SearchableCountrySelect({
  value,
  onChange,
  placeholder = "Select...",
  type,
  disabled = false,
  className = "",
}: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get display text for selected value
  const getDisplayValue = (): string => {
    const country = COUNTRIES.find((c) =>
      type === "nationality" ? c.nationality === value : c.name === value,
    );
    if (country) {
      return type === "nationality"
        ? `${country.flag} ${country.name} (${country.phoneCode})`
        : `${country.flag} ${country.name}`;
    }
    return placeholder;
  };

  // Filter countries synchronously via useMemo — no timer needed
  const filteredCountries = useMemo<Country[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      // Show first 30 when no search to keep initial render fast
      return COUNTRIES.slice(0, 30);
    }
    return SEARCH_INDEX
      .filter((entry) => entry.lower.includes(term))
      .map((entry) => entry.country);
  }, [searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    const selectedValue =
      type === "nationality" ? country.nationality : country.name;
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onChange("");
    setSearchTerm("");
  };

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Display button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full border rounded px-3 py-2 text-sm text-left flex items-center justify-between transition-all ${
          disabled
            ? "bg-gray-100 cursor-not-allowed opacity-60 border-gray-300"
            : "bg-white hover:border-amber-600 border-gray-300"
        } ${isOpen ? "border-amber-600 ring-1 ring-amber-500" : ""}`}
      >
        <span className="text-gray-800">{getDisplayValue()}</span>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {value && !disabled && (
            <div
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={16} />
            </div>
          )}
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-amber-600 rounded shadow-lg z-50">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white rounded-t">
            <div className="relative flex items-center">
              <Search
                size={16}
                className="absolute left-3 text-gray-400 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-64 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center bg-gray-50">
                No countries found
              </li>
            ) : (
              <>
                {filteredCountries.map((country) => {
                  const displayValue =
                    type === "nationality" ? country.nationality : country.name;
                  const isSelected = value === displayValue;
                  return (
                    <li key={country.code}>
                      <button
                        type="button"
                        onClick={() => handleSelect(country)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-amber-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
                          isSelected
                            ? "bg-amber-100 font-semibold text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">
                          {country.flag}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{country.name}</div>
                          <div className="text-xs text-gray-500">
                            {type === "nationality"
                              ? country.nationality
                              : country.code}{" "}
                            • {country.phoneCode}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
                {!searchTerm.trim() && filteredCountries.length < COUNTRIES.length && (
                  <li className="px-4 py-2 text-xs text-gray-400 text-center">
                    Type to search all {COUNTRIES.length} countries...
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
