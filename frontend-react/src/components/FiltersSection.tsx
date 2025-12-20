import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface FiltersSectionProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FiltersSection = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: FiltersSectionProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section id="categories" className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
          <div className="relative">
            <div className={`relative w-full transition-all duration-300 ${isFocused ? "shadow-soft" : ""}`}>
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  isFocused ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <Input
                type="text"
                placeholder="Search deals by name, company, or category..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full rounded-xl border-0 bg-secondary/50 pl-12 pr-12 py-6 text-sm font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-primary text-white shadow-lg"
                    : "bg-secondary text-slate-700 hover:border border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiltersSection;
