
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CartItem, CustomerInfo } from '@/lib/types';
import type { PreferenceItem, PreferencePayer } from 'mercadopago/dist/clients/preference/commonTypes';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 } 
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("El token de acceso de Mercado Pago no está configurado en .env");
      return NextResponse.json({ error: 'Error de configuración del servidor.' }, { status: 500 });
    }
    
    const { cartItems, shippingCost, customerInfo }: { cartItems: CartItem[], shippingCost: number, customerInfo: CustomerInfo } = await req.json();

    // 1. Validaciones
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío o es inválido.' }, { status: 400 });
    }
    if (typeof shippingCost !== 'number' || shippingCost < 0) {
        return NextResponse.json({ error: 'Costo de envío inválido.' }, { status: 400 });
    }
    if (!customerInfo || !customerInfo.phone) {
        return NextResponse.json({ error: 'Falta información del cliente, incluyendo el teléfono.' }, { status: 400 });
    }
    
    const origin = req.nextUrl.origin;

    // 2. Creación de Items para la preferencia
    const items: PreferenceItem[] = cartItems.map((item: CartItem) => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: 'ARS',
      picture_url: item.imageUrl,
      description: item.description,
    }));
    
    if (shippingCost > 0) {
      items.push({
        id: 'shipping',
        title: 'Costo de Envío',
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: 'ARS',
      });
    }

    const payer: PreferencePayer = {
        name: customerInfo.name.split(' ')[0],
        surname: customerInfo.name.split(' ').slice(1).join(' '),
        email: customerInfo.email,
        phone: {
            area_code: "", // Opcional, depende de si lo quieres separar
            number: customerInfo.phone
        }
    }
    
    // 3. Creación de la preferencia
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items,
        payer: payer,
        metadata: {
            customer_info: customerInfo
        },
        auto_return: 'approved',
        back_urls: {
          success: `https://www.corondashop.online/`,
          failure: `https://www.corondashop.online/`,
          pending: `https://www.corondashop.online/`,
        },
        notification_url: `${origin}/api/webhook`
      },
    });

    // 4. Verificación de respuesta
    if (!result.id) {
        console.error("Error en la respuesta de Mercado Pago:", result);
        throw new Error("No se generó el ID de preferencia de Mercado Pago.");
    }
    
    return NextResponse.json({ id: result.id });
    
  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error);
    const message = error?.cause?.message || error.message || 'No se pudo crear la preferencia de pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
