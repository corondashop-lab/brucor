
"use client";

import type { Sale } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

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
}

export function SaleDetailDialog({
  isOpen,
  onOpenChange,
  sale,
}: SaleDetailDialogProps) {
  if (!sale) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalle de la Compra</DialogTitle>
          <DialogDescription>
            ID del Pedido: {sale.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 max-h-[70vh] py-4">
          <ScrollArea className="pr-4 border-r">
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
                <h3 className="font-semibold mb-2">Información de Envío</h3>
                <div className="text-sm space-y-1">
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

          <ScrollArea className="pr-4">
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
        </div>

        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
