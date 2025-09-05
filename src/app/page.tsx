
"use client";

import { useState, useEffect, Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductSlider } from "@/components/product/ProductSlider";
import { products as initialProducts, initialCategories } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import type { Product, Advertisement, SliderItem, Category } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { getCollection } from "@/lib/firebase";

function ProductDisplay() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedProducts = await getCollection<Product>('products');
        const fetchedCategories = await getCollection<Category>('categories');
        const fetchedAds = await getCollection<Advertisement>('advertisements');
        
        const currentProducts = fetchedProducts.length > 0 ? fetchedProducts : initialProducts;
        const currentCategories = fetchedCategories.length > 0 ? fetchedCategories : initialCategories;

        setProducts(currentProducts);
        setCategories(currentCategories);
        
        const featuredProducts = currentProducts.filter((p: Product) => p.featured);
        setSliderItems([...featuredProducts, ...fetchedAds]);

        // We can still update localStorage as a fallback for offline, but it's not the primary source anymore.
        localStorage.setItem("minimalStoreProducts", JSON.stringify(currentProducts));
        localStorage.setItem("minimalStoreCategories", JSON.stringify(currentCategories));

      } catch (error) {
        console.error("Error fetching data, falling back to localStorage", error);
        // Fallback to localStorage if Firestore fails
        const storedProducts = localStorage.getItem("minimalStoreProducts");
        const storedCategories = localStorage.getItem("minimalStoreCategories");
        const storedAds = localStorage.getItem("minimalStoreAdvertisements");
        
        const currentProducts = storedProducts ? JSON.parse(storedProducts) : initialProducts;
        const currentCategories = storedCategories ? JSON.parse(storedCategories) : initialCategories;
        const currentAds: Advertisement[] = storedAds ? JSON.parse(storedAds) : [];

        setProducts(currentProducts);
        setCategories(currentCategories);
        const featuredProducts = currentProducts.filter((p: Product) => p.featured);
        setSliderItems([...featuredProducts, ...currentAds]);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <ProductSlider items={sliderItems} />
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
        <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Nuestros Productos</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              En nuestra tienda encontrarás productos artesanales elaborados con dedicación y respeto por la tradición familiar. Mermeladas, dulces, almíbares y pulpas que evocan momentos de felicidad y calidad en cada bocado. Descubrí nuestro catálogo y llevá a tu mesa sabores auténticos.
            </p>
        </div>
        
        <div className="flex justify-center flex-wrap gap-2">
          <Button 
            variant={!selectedCategory ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button 
              key={category.id} 
              variant={selectedCategory === category.name ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {searchTerm && (
          <div className="text-center text-sm text-muted-foreground">
            Resultados para: <span className="font-bold text-foreground">"{searchTerm}"</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
            <div className="text-center py-10 col-span-full">
              <p className="text-lg text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
        )}
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <div className="space-y-12">
        <ProductDisplay />
      </div>
    </Suspense>
  );
}

    