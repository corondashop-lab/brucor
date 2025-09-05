
"use client";

import { products as initialProducts } from "@/lib/placeholder-data";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Star, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { useParams } from "next/navigation";
import { getDocument } from "@/lib/firebase";

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const fetchedProduct = await getDocument<Product>('products', id);
            setProduct(fetchedProduct);
        } catch (error) {
            console.error("Error fetching product from Firestore, falling back to localStorage", error);
            const storedProducts = localStorage.getItem("minimalStoreProducts");
            const products = storedProducts ? JSON.parse(storedProducts) : initialProducts;
            const foundProduct = products.find((p: Product) => p.id === id);
            setProduct(foundProduct || null);
        } finally {
            setLoading(false);
        }
    }
    fetchProduct();
  }, [id]);


  if (loading) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Cargando producto...</h1>
      </div>
    );
  }


  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Agregado al carrito",
      description: `${product.name} se ha añadido a tu carrito.`,
    });
  };

  const averageRating = product.reviews.length > 0 ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length : 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square relative rounded-lg overflow-hidden border">
          <Image
            src={product.imageUrl as string}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint="product image"
          />
           {product.stock === 0 && <Badge variant="destructive" className="absolute top-3 right-3 text-sm">Agotado</Badge>}
        </div>
        <div className="flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit">{product.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
             </div>
             <span className="text-muted-foreground text-sm">({product.reviews.length} reseñas)</span>
          </div>
          <p className="text-muted-foreground mt-4 text-base">{product.description}</p>
          <p className="text-4xl font-bold text-primary mt-6">${product.price.toFixed(2)}</p>
          <p className={`text-sm font-semibold mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}</p>
          <div className="mt-8">
            <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0} className="w-full sm:w-auto">
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Opiniones de Clientes</h2>
        <div className="space-y-6">
          {product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review.id} className="border p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.author}</p>
                    <div className="flex items-center gap-1">
                        {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{new Date(review.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="mt-2 text-sm">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Todavía no hay reseñas para este producto.</p>
                <p className="text-sm text-muted-foreground">¡Sé el primero en dejar una!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
