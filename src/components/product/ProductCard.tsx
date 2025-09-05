
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addItem(product);
    toast({
      title: "Agregado al carrito",
      description: `${product.name} se ha añadido a tu carrito.`,
    });
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-lg group">
        <Link href={`/products/${product.id}`} className="block">
      <CardHeader className="p-0 relative">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              data-ai-hint="product image"
            />
          </div>
          {product.stock === 0 && <Badge variant="destructive" className="absolute top-3 right-3 text-sm">Agotado</Badge>}
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase">{product.category}</p>
        <CardTitle className="text-base mt-1 h-12 overflow-hidden">
            {product.name}
        </CardTitle>
      </CardContent>
      </Link>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
        <Button size="icon" onClick={handleAddToCart} disabled={product.stock === 0} aria-label="Agregar al carrito">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
