
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Category } from "@/lib/types";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (product: Product) => Promise<void>;
  product: Product | null;
  categories: Category[];
}

export function ProductDialog({ isOpen, onOpenChange, onSave, product, categories }: ProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        const initialData = product || {
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category: '',
            imageUrl: '',
            reviews: []
        };
        setFormData(initialData);
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [id]: numValue }));
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };
  
  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
        toast({ variant: "destructive", title: "Campos Incompletos", description: "Por favor, completa Nombre, Precio y Categoría."});
        return;
    }
    
    setIsSaving(true);
    
    try {
        await onSave(formData as Product);
        onOpenChange(false);
    } catch (error) {
        console.error("Error saving product:", error);
        toast({ variant: "destructive", title: "Error al Guardar", description: "No se pudo guardar el producto." });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Modifica los detalles del producto." : "Completa los detalles del nuevo producto."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
                <Label>Imagen del Producto</Label>
                <div className="aspect-square relative rounded-md overflow-hidden border">
                    <Image src={formData.imageUrl || 'https://placehold.co/600x600.png'} alt={formData.name || 'Product Image'} fill className="object-cover"/>
                </div>
                 <Input 
                    id="imageUrl" 
                    placeholder="Pega la URL de la imagen aquí" 
                    value={formData.imageUrl || ''} 
                    onChange={handleChange} 
                    className="text-sm" 
                 />
            </div>
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" value={formData.name || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={formData.description || ''} onChange={handleChange} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <Input id="price" type="number" value={formData.price ?? ''} onChange={handleNumericChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input id="stock" type="number" value={formData.stock ?? ''} onChange={handleNumericChange} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
