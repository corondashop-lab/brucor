
'use server';
/**
 * @fileOverview Un agente de IA que sugiere productos a un cliente basándose en su historial de compras.
 *
 * - suggestProducts - Una función que maneja el proceso de sugerencia de productos.
 * - SuggestProductsInput - El tipo de entrada para la función suggestProducts.
 * - SuggestProductsOutput - El tipo de retorno para la función suggestProducts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Product, CartItem } from '@/lib/types';

const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    stock: z.number(),
});

const SuggestProductsInputSchema = z.object({
  purchasedItems: z.array(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
      category: z.string(),
  })).describe("La lista de productos que el cliente ya ha comprado."),
  availableProducts: z.array(ProductSchema).describe("La lista de todos los productos disponibles en la tienda que se pueden sugerir."),
});
export type SuggestProductsInput = z.infer<typeof SuggestProductsInputSchema>;


const SuggestedProductSchema = z.object({
    productId: z.string().describe("El ID del producto sugerido."),
    productName: z.string().describe("El nombre del producto sugerido."),
    justification: z.string().describe("Una breve justificación de por qué este producto sería una buena recomendación para el cliente."),
});

const SuggestProductsOutputSchema = z.object({
  suggestions: z.array(SuggestedProductSchema).describe("Una lista de hasta 3 productos recomendados para el cliente."),
});
export type SuggestProductsOutput = z.infer<typeof SuggestProductsOutputSchema>;

export async function suggestProducts(input: SuggestProductsInput): Promise<SuggestProductsOutput> {
  return suggestProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductsPrompt',
  input: { schema: SuggestProductsInputSchema },
  output: { schema: SuggestProductsOutputSchema },
  prompt: `Eres un asistente de ventas experto en una tienda de productos artesanales (mermeladas, dulces, etc.). Tu objetivo es analizar el historial de compras de un cliente y sugerirle otros productos de la tienda que probablemente le encantarán.

Historial de compra del cliente:
{{#each purchasedItems}}
- Producto: {{{name}}} (Categoría: {{{category}}})
{{/each}}

Catálogo de productos disponibles:
{{#each availableProducts}}
- ID: {{{id}}}, Producto: {{{name}}}, Descripción: {{{description}}}, Categoría: {{{category}}}
{{/each}}

Basándote en los productos que el cliente ya compró, recomiéndale hasta 3 productos del catálogo disponible que aún no haya comprado. Para cada sugerencia, proporciona una breve justificación personalizada explicando por qué crees que le gustaría. No sugieras productos que ya ha comprado.`,
});


const suggestProductsFlow = ai.defineFlow(
  {
    name: 'suggestProductsFlow',
    inputSchema: SuggestProductsInputSchema,
    outputSchema: SuggestProductsOutputSchema,
  },
  async (input) => {
    
    const purchasedIds = input.purchasedItems.map(item => item.id);
    const productsToSuggest = input.availableProducts.filter(p => !purchasedIds.includes(p.id));

    const { output } = await prompt({
        ...input,
        availableProducts: productsToSuggest,
    });
    return output!;
  }
);
