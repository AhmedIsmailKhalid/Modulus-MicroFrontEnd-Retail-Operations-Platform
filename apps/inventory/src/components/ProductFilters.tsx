import { Search, X } from "lucide-react";

import { Button } from "@modulus/ui";

import { useInventoryStore } from "../store/inventoryStore";

export function ProductFilters() {
  const {
    search, setSearch,
    categoryFilter, setCategoryFilter,
    stockFilter, setStockFilter,
    categories,
  } = useInventoryStore();

  const hasActiveFilters = search || categoryFilter || stockFilter;

  function clearFilters() {
    setSearch("");
    setCategoryFilter("");
    setStockFilter("");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search name or SKU..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          data-testid="product-search"
        />
      </div>

      {/* Category filter */}
      <select
        value={categoryFilter}
        onChange={(e) => { setCategoryFilter(e.target.value); }}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        data-testid="category-filter"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      {/* Stock filter */}
      <select
        value={stockFilter}
        onChange={(e) => { setStockFilter(e.target.value); }}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        data-testid="stock-filter"
      >
        <option value="">All Stock Levels</option>
        <option value="in_stock">In Stock</option>
        <option value="low_stock">Low Stock</option>
        <option value="out_of_stock">Out of Stock</option>
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X className="h-3.5 w-3.5" />}>
          Clear
        </Button>
      )}
    </div>
  );
}
