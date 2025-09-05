
"use client";

import type { Sale, Product } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Trash2, Wand2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { suggestProducts, type SuggestProductsOutput } from "@/ai/flows/suggest-products-flow";
import { getCollection } from "@/lib/firebase";

type SaleStatus = "Completado" | "Procesando" | "Cancelado";

const statusVariant: Record<SaleStatus, "default" | "secondary" | "destructive"> = {
  Completado: "default",
  Procesando: "secondary",
  Cancelado: "destructive",
};

interface SaleDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sale: Sale | null;
  onDelete: (saleId: string) => void;
}

export function SaleDetailDialog({
  isOpen,
  onOpenChange,
  sale,
  onDelete,
}: SaleDetailDialogProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestProductsOutput | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSuggestions(null);
    }
  }, [isOpen]);
  
  useEffect(() => {
    const fetchProducts = async () => {
        const products = await getCollection<Product>('products');
        setAllProducts(products);
    }
    fetchProducts();
  }, [])

  if (!sale) return null;
  
  const handleDelete = () => {
    onDelete(sale.id);
    onOpenChange(false);
    setIsAlertOpen(false);
  }

  const handleGenerateSuggestions = async () => {
    if (!sale || sale.items.length === 0 || allProducts.length === 0) return;

    setIsGenerating(true);
    setSuggestions(null);
    try {
      const result = await suggestProducts({
        purchasedItems: sale.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
        })),
        availableProducts: allProducts
      });
      setSuggestions(result);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalle de la Venta</DialogTitle>
          <DialogDescription>
            ID de la Venta: {sale.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh]">
          <ScrollArea className="pr-4 lg:col-span-1">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Resumen</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span>{new Date(sale.date).toLocaleDateString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={statusVariant[sale.status as SaleStatus]}>{sale.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">${sale.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Información del Cliente</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span>{sale.customerInfo?.name || 'No disponible'}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{sale.customerInfo?.email || 'No disponible'}</span>
                  </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono:</span>
                        <span>{sale.customerInfo?.phone || 'No disponible'}</span>
                    </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Dirección:</span>
                    <span>{sale.customerInfo?.address || 'No disponible'}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Ciudad:</span>
                    <span>{sale.customerInfo ? `${sale.customerInfo.city} (${sale.customerInfo.zip})` : 'No disponible'}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <ScrollArea className="pr-4 lg:col-span-1">
            <div className="space-y-4">
               <h3 className="font-semibold">Productos Comprados</h3>
                {sale.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-md overflow-hidden border">
                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image" />
                            </div>
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
                { sale.items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay información de productos para esta venta.</p>
                )}
            </div>
          </ScrollArea>
          
           <ScrollArea className="pr-4 lg:col-span-1 bg-secondary/50 rounded-lg p-4">
             <div className="space-y-4">
                <h3 className="font-semibold">Sugerencias con IA</h3>
                {sale.items.length > 0 ? (
                  <>
                    <Button onClick={handleGenerateSuggestions} disabled={isGenerating || allProducts.length === 0} className="w-full">
                      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                      {isGenerating ? "Generando..." : "Generar Sugerencias"}
                    </Button>
                    {suggestions && suggestions.suggestions.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {suggestions.suggestions.map(suggestion => (
                          <div key={suggestion.productId} className="text-sm border-l-2 border-primary pl-3">
                            <p className="font-medium">{suggestion.productName}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.justification}</p>
                          </div>
                        ))}
                      </div>
                    )}
                     {suggestions && suggestions.suggestions.length === 0 && !isGenerating && (
                        <p className="text-sm text-muted-foreground text-center pt-2">No se encontraron más sugerencias para este cliente.</p>
                     )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center pt-2">No hay productos en esta venta para generar sugerencias.</p>
                )}
             </div>
          </ScrollArea>
        </div>

        <DialogFooter className="pt-4 border-t sm:justify-between">
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Venta
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la venta del historial.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Sí, eliminar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
