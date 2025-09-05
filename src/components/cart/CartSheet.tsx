
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeItem } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Carrito ({cartCount})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {cartCount > 0 ? (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-6 p-6 pr-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        data-ai-hint="product image"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-2 text-center px-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <SheetClose asChild>
                <Button variant="link" asChild>
                   <Link href="/">Comienza a comprar</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
        {cartCount > 0 && (
          <SheetFooter className="p-6 bg-secondary/50 flex-col space-y-4 border-t">
             <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Los costos de envío e impuestos se calculan en el checkout.
            </p>
            <div className="flex flex-col space-y-2">
                <SheetClose asChild>
                    <Button asChild className="w-full">
                        <Link href="/checkout">Finalizar Compra</Link>
                    </Button>
                </SheetClose>
                 <SheetClose asChild>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/cart">Ver Carrito</Link>
                    </Button>
                 </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
