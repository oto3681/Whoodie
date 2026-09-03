import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Tag, 
  Layers, 
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';

interface AdminCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (cat: ProductCategory) => void;
}

const PRESET_SUGGESTIONS = [
  'Mugs & Drinkware',
  'Corporate Gifts & Hampers',
  'Vehicle Branding & Wraps',
  'Calendars & Executive Diaries',
  'Custom Packaging & Boxes',
  'Uniforms & Workwear',
  'Canvas & Acrylic Mounting',
  'Lanyards & Staff ID Cards',
  'Stationery & Business Cards',
  'Embroidery & Monograms'
];

export const AdminCategoryManagerModal: React.FC<AdminCategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  const { 
    categories, 
    products, 
    addCategory, 
    removeCategory, 
    renameCategory, 
    resetCategories,
    showToast 
  } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingNewName, setEditingNewName] = useState('');
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<ProductCategory>('Branding');
  const [confirmReset, setConfirmReset] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingCat) {
          setDeletingCat(null);
        } else if (editingCat) {
          setEditingCat(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Auto focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deletingCat, editingCat, onClose]);

  if (!isOpen) return null;

  const handleAddCategory = (nameToAdd?: string) => {
    const targetName = (nameToAdd !== undefined ? nameToAdd : newCatName).trim();
    if (!targetName) {
      showToast('Validation Error', 'Please type a category name.', 'error');
      return;
    }

    const success = addCategory(targetName);
    if (success) {
      setNewCatName('');
      if (onSelectCategory) {
        onSelectCategory(targetName as ProductCategory);
      }
    }
  };

  const handleStartRename = (cat: string) => {
    setEditingCat(cat);
    setEditingNewName(cat);
  };

  const handleSaveRename = (oldName: string) => {
    if (!editingNewName.trim()) {
      showToast('Validation Error', 'Category name cannot be empty.', 'error');
      return;
    }
    const success = renameCategory(oldName, editingNewName.trim());
    if (success) {
      setEditingCat(null);
      setEditingNewName('');
    }
  };

  const handleStartDelete = (cat: string) => {
    const productCount = products.filter(p => p.category === cat).length;
    if (productCount === 0) {
      // Direct delete if empty
      removeCategory(cat);
    } else {
      // Open reassign modal prompt
      setDeletingCat(cat);
      const remaining = categories.filter(c => c !== cat && c !== 'All');
      if (remaining.length > 0) {
        setReassignTarget(remaining[0]);
      }
    }
  };

  const handleConfirmDeleteWithReassign = () => {
    if (!deletingCat) return;
    removeCategory(deletingCat, reassignTarget);
    setDeletingCat(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 id="category-modal-title" className="text-lg font-bold">
                Catalogue Categories Manager
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add, rename, or remove product categories across the live catalogue and shop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Close modal (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Add New Category Input */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 space-y-3">
            <label className="text-xs font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Add New Product Category
            </label>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCategory();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Mugs & Drinkware, Vehicle Branding, Corporate Gifts..."
                className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-100 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </form>

            {/* Quick Suggestions */}
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Add Suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SUGGESTIONS.filter(preset => !categories.includes(preset as ProductCategory)).slice(0, 6).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddCategory(preset)}
                    className="text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-blue-500" />
                    <span>{preset}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog with Reassign */}
          {deletingCat && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    Remove &ldquo;{deletingCat}&rdquo; from Catalogue?
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    There are <span className="font-extrabold">{products.filter(p => p.category === deletingCat).length}</span> product(s) assigned to this category. Select a new category to move them to before removing:
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="flex-1">
                  <select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value as ProductCategory)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                  >
                    {categories
                      .filter(c => c !== deletingCat && c !== 'All')
                      .map(c => (
                        <option key={c} value={c}>
                          Move products to: {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmDeleteWithReassign}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Removal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCat(null)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Categories ({categories.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Total Products: {products.length}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900/60">
              {categories.map((cat) => {
                const productCount = cat === 'All' 
                  ? products.length 
                  : products.filter(p => p.category === cat).length;
                const isSystemBase = cat === 'All';
                const isEditingThis = editingCat === cat;

                return (
                  <div 
                    key={cat}
                    className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                      isSystemBase 
                        ? 'bg-slate-50/50 dark:bg-slate-800/20' 
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Left: Info or Edit Input */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSystemBase 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        <Tag className="w-4 h-4" />
                      </div>

                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingNewName}
                            onChange={(e) => setEditingNewName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(cat);
                              if (e.key === 'Escape') setEditingCat(null);
                            }}
                            autoFocus
                            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-blue-500 rounded-lg focus:outline-none flex-1 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(cat)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                            title="Save name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCat(null)}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs"
                            title="Cancel rename"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {cat}
                            </span>
                            {isSystemBase && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded">
                                Root View
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isSystemBase ? (
                              <span>Default catalogue filter for all items</span>
                            ) : (
                              <span>
                                {productCount} {productCount === 1 ? 'item' : 'items'} in catalogue
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {!isEditingThis && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSystemBase ? (
                          <span className="text-[11px] text-slate-400 italic px-2 py-1">
                            System Required
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartRename(cat)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                              title={`Rename "${cat}" category`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartDelete(cat)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                              title={`Remove "${cat}" category`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset to Default Categories */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-medium">Restore default catalogue categories?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetCategories();
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold text-[11px]"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-[11px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Default Categories</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Done Managing
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
