import { useState } from "react";

import { Modal, Button, Input } from "@modulus/ui";
import type { Category } from "@modulus/types";

import { useInventoryStore } from "../store/inventoryStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryModalProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryModal({ onSuccess, onError: _onError }: CategoryModalProps) {
  const {
    isCategoryOpen, closeCategory,
    categories, addCategory, updateCategory,
  } = useInventoryStore();

  const [mode, setMode]         = useState<"list" | "add" | "edit">("list");
  const [name, setName]         = useState("");
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [error, setError]       = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setEditTarget(null);
    setError("");
    setMode("list");
  }

  function handleClose() {
    resetForm();
    closeCategory();
  }

  async function handleAdd() {
    if (!name.trim()) { setError("Name is required"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to add category");
      }
      const cat = await res.json() as Category;
      addCategory(cat);
      onSuccess(`Category "${cat.name}" added.`);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!editTarget || !name.trim()) { setError("Name is required"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to rename category");
      }
      const cat = await res.json() as Category;
      updateCategory(cat);
      onSuccess(`Category renamed to "${cat.name}".`);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename category");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={isCategoryOpen}
      onClose={handleClose}
      title="Manage Categories"
      size="sm"
      data-testid="category-modal"
    >
      {mode === "list" && (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-1">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <span className="text-sm text-gray-800">{cat.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditTarget(cat);
                    setName(cat.name);
                    setMode("edit");
                  }}
                >
                  Rename
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setMode("add"); }}
            className="mt-1"
          >
            + Add Category
          </Button>
        </div>
      )}

      {(mode === "add" || mode === "edit") && (
        <div className="flex flex-col gap-4">
          <Input
            label={mode === "add" ? "Category Name" : `Rename "${editTarget?.name ?? ""}"`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            error={error}
            placeholder="e.g. Electronics"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Back
            </Button>
            <Button
              variant="primary"
              loading={isSubmitting}
              onClick={() => { void (mode === "add" ? handleAdd() : handleEdit()); }}
            >
              {mode === "add" ? "Add" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
