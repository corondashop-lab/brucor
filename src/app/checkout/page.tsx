
"use client";

import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import type { CustomerInfo, Sale, StoredUser } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addOrUpdateDocument, getDocument } from "@/lib/firebase";

const DEFAULT_SHIPPING_COST = 1500;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, isCartLoaded } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(DEFAULT_SHIPPING_COST);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });
  
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  useEffect(() => {
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-AR' });
    } else {
        console.error("Mercado Pago public key is not configured.");
        toast({
            variant: "destructive",
            title: "Error de Configuración",
            description: "La clave pública de Mercado Pago no está disponible.",
        });
    }
  }, [publicKey, toast]);

  useEffect(() => {
     const fetchShippingCost = async () => {
        const shippingDoc = await getDocument<{cost: number}>("settings", "shipping");
        if (shippingDoc) {
            setShippingCost(shippingDoc.cost);
        }
     }
     fetchShippingCost();
  }, []);

  useEffect(() => {
    if (user) {
        setCustomerInfo(prev => ({
            ...prev,
            name: user.name,
            email: user.email,
            userId: user.id
        }));
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomerInfo(prev => ({...prev, [id]: value}));
  }

  const saveSaleToFirestore = async () => {
    if (!user) {
        console.error("User not logged in, cannot save sale.");
        return;
    }
    const saleCustomerInfo: CustomerInfo = {
        ...customerInfo,
        userId: user.id
    };

    const newSale: Omit<Sale, 'id'> = {
      customerInfo: saleCustomerInfo,
      date: new Date().toISOString(),
      total: total,
      status: 'Procesando',
      items: cartItems
    };

    try {
        const saleId = await addOrUpdateDocument("sales", newSale);
        
        // After saving the sale, update the user's document with the new sale ID.
        const userDoc = await getDocument<StoredUser>('users', user.id);
        const existingSaleIds = userDoc?.saleIds || [];
        await addOrUpdateDocument('users', {
            saleIds: [...existingSaleIds, saleId]
        }, user.id);

    } catch(error) {
        console.error("Failed to save sale to Firestore:", error);
        toast({variant: "destructive", title: "Error de Red", description: "No se pudo guardar la venta en la base de datos."})
    }
  }


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPreferenceId(null);

    const isFormValid = Object.values(customerInfo).every(value => value && String(value).trim() !== '');
    if (!isFormValid) {
        toast({
            variant: "destructive",
            title: "Formulario Incompleto",
            description: "Por favor, completa todos los campos de envío.",
        });
        setIsLoading(false);
        return;
    }

    toast({
      title: "Creando orden...",
      description: "Espera un momento mientras preparamos tu pago.",
    });

    try {
      // First save the sale to get a consistent state before payment
      await saveSaleToFirestore();
      
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems, shippingCost, customerInfo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la preferencia de pago');
      }

      if (data.id) {
        setPreferenceId(data.id);
        clearCart();
      } else {
        throw new Error('No se recibió el ID de preferencia de la API.');
      }

    } catch (error) {
      console.error("Error during payment preference creation:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo procesar el pago. Por favor, intenta de nuevo.";
      toast({
        variant: "destructive",
        title: "¡Error!",
        description: errorMessage,
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const total = cartTotal + shippingCost;
  
  if (!isCartLoaded) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando resumen...</p>
        </div>
    );
  }

  if (cartItems.length === 0 && !preferenceId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <Button asChild className="mt-4">
          <Link href="/">Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="order-2 lg:order-1">
          {!preferenceId ? (
            <>
                <h1 className="text-2xl font-semibold mb-6">Información de Envío</h1>
                <form onSubmit={handlePayment} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre y Apellido</Label>
                            <Input id="name" placeholder="Juan Pérez" required value={customerInfo.name} onChange={handleInputChange} disabled={!!user}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="tu@email.com" required value={customerInfo.email} onChange={handleInputChange} disabled={!!user}/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono de Contacto</Label>
                        <Input id="phone" type="tel" placeholder="Ej: 3425123456" required value={customerInfo.phone} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" placeholder="Av. Siempre Viva 123" required value={customerInfo.address} onChange={handleInputChange}/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input id="city" placeholder="Springfield" required value={customerInfo.city} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zip">C.P.</Label>
                            <Input id="zip" placeholder="B1638" required value={customerInfo.zip} onChange={handleInputChange}/>
                        </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full mt-6" disabled={isLoading || cartItems.length === 0}>
                        {isLoading ? 'Procesando...' : 'Confirmar y Pagar'}
                    </Button>
                </form>
            </>
          ) : (
             <div id="wallet_container" className="mt-6 w-full">
                <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts:{ valueProp: 'smart_option'}}} />
            </div>
          )}
        </div>
        <div className="order-1 lg:order-2">
            <Card>
                <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Envío</span>
                            <span>${shippingCost.toFixed(2)}</span>
                        </div>
                    </div>
                     <Separator className="my-4" />
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


