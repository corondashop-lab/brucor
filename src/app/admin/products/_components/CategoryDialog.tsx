
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category, Product } from "@/lib/types";
import { Trash2, Pencil, PlusCircle, Save } from "lucide-react";

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (categories: Category[]) => void;
  categories: Category[];
  products: Product[];
}

export function CategoryDialog({ isOpen, onOpenChange, onSave, categories: initialCategories, products }: CategoryDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCategories(initialCategories);
    }
  }, [initialCategories, isOpen]);
  
  const isCategoryInUse = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return false;
    return products.some(p => p.category === category.name);
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") return;
    const newCategory: Category = {
      id: String(Date.now()),
      name: newCategoryName.trim(),
    };
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName("");
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategoryId || editingCategoryName.trim() === "") return;
    setCategories(prev => prev.map(c => c.id === editingCategoryId ? { ...c, name: editingCategoryName.trim() } : c));
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    if (isCategoryInUse(categoryId)) {
        alert("No se puede eliminar esta categoría porque está siendo utilizada por uno o más productos.");
        return;
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  }
  
  const handleSave = () => {
    onSave(categories);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías</DialogTitle>
          <DialogDescription>
            Añade, edita o elimina las categorías de productos de tu tienda.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input 
                    placeholder="Nombre de la nueva categoría" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory}><PlusCircle className="h-4 w-4 mr-2"/>Añadir</Button>
            </div>
            
            <ScrollArea className="h-60 border rounded-md p-2">
                <div className="space-y-2">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        {editingCategoryId === cat.id ? (
                             <Input 
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                                onBlur={handleUpdateCategory}
                                autoFocus
                                className="h-8"
                            />
                        ) : (
                            <p className="text-sm">{cat.name}</p>
                        )}
                       
                        <div className="flex gap-1">
                            {editingCategoryId === cat.id ? (
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateCategory}>
                                    <Save className="h-4 w-4 text-green-600" />
                                </Button>
                            ) : (
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditCategory(cat)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}

                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteCategory(cat.id)} disabled={isCategoryInUse(cat.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
