import { Search, X } from "lucide-react";

import { Button } from "@modulus/ui";

import { useOrdersStore } from "../store/ordersStore";

const STATUS_OPTIONS = [
  { value: "pending",    label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
];

export function OrderFilters() {
  const { search, setSearch, statusFilter, setStatusFilter } = useOrdersStore();

  const hasActiveFilters = search || statusFilter;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[240px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search order ID or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          data-testid="order-search"
        />
      </div>

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); }}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        data-testid="status-filter"
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSearch(""); setStatusFilter(""); }}
          leftIcon={<X className="h-3.5 w-3.5" />}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
