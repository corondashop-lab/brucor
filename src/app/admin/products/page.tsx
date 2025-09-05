
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, PlusCircle, Settings, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { ProductDialog } from "./_components/ProductDialog"
import { CategoryDialog } from "./_components/CategoryDialog"
import type { Product, Category } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { getCollection, addOrUpdateDocument, deleteDocument } from "@/lib/firebase"
import { products as initialProducts, initialCategories } from "@/lib/placeholder-data"

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchedProducts = await getCollection<Product>("products");
                const fetchedCategories = await getCollection<Category>("categories");

                if (fetchedProducts.length > 0) {
                    setProducts(fetchedProducts);
                    localStorage.setItem("minimalStoreProducts", JSON.stringify(fetchedProducts));
                } else {
                    // Fallback to initial data if nothing in Firestore
                    setProducts(initialProducts);
                    localStorage.setItem("minimalStoreProducts", JSON.stringify(initialProducts));
                }

                if (fetchedCategories.length > 0) {
                    setCategories(fetchedCategories);
                    localStorage.setItem("minimalStoreCategories", JSON.stringify(fetchedCategories));
                } else {
                    // Fallback to initial data
                    setCategories(initialCategories);
                    localStorage.setItem("minimalStoreCategories", JSON.stringify(initialCategories));
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos de Firestore. Usando datos locales." });
                // Fallback to local data on error
                const localProducts = localStorage.getItem("minimalStoreProducts");
                setProducts(localProducts ? JSON.parse(localProducts) : initialProducts);
                const localCategories = localStorage.getItem("minimalStoreCategories");
                setCategories(localCategories ? JSON.parse(localCategories) : initialCategories);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);


    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsProductDialogOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    };

    const handleDeleteProduct = async (product: Product) => {
        if (!product.id) return;
        try {
            await deleteDocument("products", product.id);
            const updatedProducts = products.filter(p => p.id !== product.id);
            setProducts(updatedProducts);
            localStorage.setItem("minimalStoreProducts", JSON.stringify(updatedProducts));
            toast({ title: "Producto Eliminado", description: `${product.name} ha sido eliminado.` });
        } catch (error) {
            console.error("Error deleting product:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el producto." });
        }
    };

    const handleSaveProduct = async (productData: Product) => {
        try {
            const productId = await addOrUpdateDocument("products", productData, productData.id);
            const updatedProduct = { ...productData, id: productId };

            let updatedProducts;
            if (productData.id && products.some(p => p.id === productData.id)) {
                updatedProducts = products.map(p => p.id === productId ? updatedProduct : p)
            } else {
                updatedProducts = [...products, updatedProduct]
            }
            setProducts(updatedProducts);
            localStorage.setItem("minimalStoreProducts", JSON.stringify(updatedProducts));

            toast({ title: "Producto Guardado", description: "Los cambios se han guardado exitosamente." });
        } catch (error) {
            console.error("Error saving product:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el producto." });
        }
    };
    
    const handleSaveCategories = async (updatedCategories: Category[]) => {
        try {
            setCategories(updatedCategories); // Optimistic update
            
            for (const cat of updatedCategories) {
                await addOrUpdateDocument("categories", cat, cat.id);
            }
            
            const freshCategories = await getCollection<Category>("categories");
            setCategories(freshCategories);
            localStorage.setItem("minimalStoreCategories", JSON.stringify(freshCategories));

            toast({
                title: "Categorías actualizadas",
                description: "La lista de categorías ha sido guardada en Firestore."
            });
        } catch (error) {
             console.error("Error saving categories:", error);
            toast({ variant: "destructive", title: "Error de Firestore", description: "No se pudieron guardar las categorías en la base de datos." });
        }
    }


    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                 <h1 className="text-3xl font-bold">Productos</h1>
                 <div className="flex gap-2">
                     <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Gestionar Categorías
                     </Button>
                     <Button onClick={handleAddProduct}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar Producto
                     </Button>
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todos los productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Imagen</span>
                                </TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead className="hidden md:table-cell">Stock</TableHead>
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={product.imageUrl as string || 'https://placehold.co/64x64.png'}
                                            width="64"
                                            data-ai-hint="product image"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                                            {product.stock > 0 ? "Activo" : "Agotado"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>Editar</DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    onClick={() => handleDeleteProduct(product)}
                                                >
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ProductDialog
                isOpen={isProductDialogOpen}
                onOpenChange={setIsProductDialogOpen}
                onSave={handleSaveProduct}
                product={selectedProduct}
                categories={categories}
            />
            
            <CategoryDialog
                isOpen={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                categories={categories}
                products={products}
                onSave={handleSaveCategories}
            />
        </div>
    )
}
