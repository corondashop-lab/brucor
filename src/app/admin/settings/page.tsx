
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { Product, Advertisement, AboutData } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { getCollection, addOrUpdateDocument, getDocument, deleteDocument } from '@/lib/firebase';
import { products as initialProducts } from '@/lib/placeholder-data';


const defaultAboutData: AboutData = {
  id: 'main-about-us',
  title: "Nuestra Esencia",
  text: "Desde nuestra historia familiar, tejemos calidad y autenticidad en cada producto. Creemos en cuidar a las personas y al planeta, ofreciendo soluciones que inspiran confianza. Nos guían la responsabilidad, la innovación y un compromiso sincero con nuestra comunidad.",
  imageUrl: "https://placehold.co/600x600.png",
  imageHint: "craftsmanship teamwork",
  highlight: "Calidad, Compromiso, Comunidad.",
};

const DEFAULT_SHIPPING_COST = 1500;

export default function AdminSettingsPage() {
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
  const [shippingCost, setShippingCost] = useState(DEFAULT_SHIPPING_COST);
  const [products, setProducts] = useState<Product[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [deletedAdIds, setDeletedAdIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const ensureAbsoluteUrl = useCallback((url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url;
    }
    return `https://${url}`;
  }, []);


  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedAbout, fetchedShipping, fetchedProducts, fetchedAds] = await Promise.all([
                getDocument<AboutData>("settings", "aboutUs"),
                getDocument<{cost: number}>("settings", "shipping"),
                getCollection<Product>("products"),
                getCollection<Advertisement>("advertisements")
            ]);

            if (fetchedAbout) setAboutData(fetchedAbout);
            else await addOrUpdateDocument("settings", defaultAboutData, "aboutUs");

            if (fetchedShipping) setShippingCost(fetchedShipping.cost);
            else await addOrUpdateDocument("settings", { cost: DEFAULT_SHIPPING_COST }, "shipping");

            setProducts(fetchedProducts.length > 0 ? fetchedProducts : initialProducts);
            setAdvertisements(fetchedAds);

        } catch (error) {
            console.error("Error fetching settings:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la configuración de Firestore." });
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setAboutData(prev => ({ ...prev, [id]: value }));
  };

  const handleShippingCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setShippingCost(value === '' ? 0 : Number(value));
  }

  const handleFeaturedToggle = (productId: string) => {
    const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, featured: !p.featured } : p
    );
    setProducts(updatedProducts);
  };
  
  // Advertisement Handlers
  const handleAddAd = () => {
    const newAd: Advertisement = {
      id: `ad-${Date.now()}`,
      name: 'Nueva Publicidad',
      description: 'Descripción de la publicidad.',
      imageUrl: 'https://placehold.co/1280x720.png',
      type: 'advertisement'
    };
    setAdvertisements(prev => [...prev, newAd]);
  };

  const handleAdChange = (id: string, field: 'name' | 'description' | 'imageUrl', value: string) => {
    setAdvertisements(prev => prev.map(ad => ad.id === id ? { ...ad, [field]: value } : ad));
  };
  
  const handleDeleteAd = (id: string) => {
    setAdvertisements(prev => prev.filter(ad => ad.id !== id));
    setDeletedAdIds(prev => [...prev, id]);
  };


  const handleSave = async () => {
    setSaving(true);
    try {
        await Promise.all([
            addOrUpdateDocument("settings", aboutData, "aboutUs"),
            addOrUpdateDocument("settings", { cost: shippingCost }, "shipping"),
            ...products.map(product => addOrUpdateDocument("products", { featured: !!product.featured }, product.id)),
            ...advertisements.map(ad => addOrUpdateDocument("advertisements", ad, ad.id)),
            ...deletedAdIds.map(id => deleteDocument("advertisements", id))
        ]);

        setDeletedAdIds([]);

        toast({
            title: "Guardado Exitoso",
            description: "La configuración de la tienda ha sido actualizada.",
        });

    } catch (error) {
        console.error("Error saving settings:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración." });
    } finally {
        setSaving(false);
    }
  };
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configuración de la Tienda</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sección "Nosotros"</CardTitle>
          <CardDescription>Edita el contenido que se muestra en la página "Nosotros".</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <Label>Imagen de la Sección</Label>
               <div className="aspect-square relative rounded-md overflow-hidden border">
                    <Image src={ensureAbsoluteUrl(aboutData.imageUrl) || 'https://placehold.co/600x600.png'} alt="Preview" fill className="object-cover"/>
                </div>
                <Input id="imageUrl" placeholder="Pega la URL de la imagen aquí" value={aboutData.imageUrl} onChange={handleInputChange} className="text-sm" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={aboutData.title} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Texto Principal</Label>
                <Textarea id="text" value={aboutData.text} onChange={handleInputChange} rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlight">Texto Resaltado (con ícono)</Label>
                <Input id="highlight" value={aboutData.highlight} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="imageHint">Palabras clave para imagen (AI Hint)</Label>
                <Input id="imageHint" value={aboutData.imageHint} onChange={handleInputChange} placeholder="ej: trabajo equipo" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Costo de Envío</CardTitle>
              <CardDescription>Define el costo de envío que se aplicará a todas las compras.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-2 max-w-sm">
                  <Label htmlFor="shippingCost">Costo de Envío ($)</Label>
                  <Input 
                    id="shippingCost" 
                    type="number" 
                    value={shippingCost} 
                    onChange={handleShippingCostChange} 
                    placeholder="Ej: 1500"
                  />
              </div>
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Productos Destacados para el Slider</CardTitle>
          <CardDescription>Selecciona los productos que aparecerán en el carrusel de la página principal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-2 rounded-md border">
                        <Label htmlFor={`featured-${product.id}`} className="font-normal">{product.name}</Label>
                        <Switch
                            id={`featured-${product.id}`}
                            checked={!!product.featured}
                            onCheckedChange={() => handleFeaturedToggle(product.id)}
                        />
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestionar Publicidad del Slider</CardTitle>
          <CardDescription>Añade o elimina banners de publicidad en el carrusel principal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {advertisements.map(ad => (
              <div key={ad.id} className="p-4 rounded-md border grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                <div className="space-y-2">
                  <Label>Imagen</Label>
                  <div className="aspect-video relative rounded-md overflow-hidden border">
                    <Image src={ensureAbsoluteUrl(ad.imageUrl) || 'https://placehold.co/1280x720.png'} alt={ad.name} fill className="object-cover" />
                  </div>
                  <Input placeholder="Pega la URL de la imagen aquí" value={ad.imageUrl} onChange={(e) => handleAdChange(ad.id, 'imageUrl', e.target.value)} className="text-sm" />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`ad-name-${ad.id}`}>Título</Label>
                    <Input id={`ad-name-${ad.id}`} value={ad.name} onChange={(e) => handleAdChange(ad.id, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`ad-desc-${ad.id}`}>Descripción</Label>
                    <Textarea id={`ad-desc-${ad.id}`} value={ad.description} onChange={(e) => handleAdChange(ad.id, 'description', e.target.value)} />
                  </div>
                </div>
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleDeleteAd(ad.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={handleAddAd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Publicidad
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
        </Button>
      </div>

    </div>
  );
}
