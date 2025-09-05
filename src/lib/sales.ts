
import type { Sale } from './types';

// Mock data for sales
export const initialSales: Sale[] = [
  { 
    id: "SALE-001", 
    customerInfo: { name: "Ana Pérez", email: "ana.perez@example.com", phone: "1122334455", address: "Calle Falsa 123", city: "Springfield", zip: "12345" }, 
    date: "2023-10-28T10:00:00Z", 
    total: 4950.50, 
    status: "Completado",
    items: [
        { id: '1', name: 'Mermelada de Frutilla Artesanal', description: '...', price: 1850.00, imageUrl: 'https://placehold.co/600x600.png', category: 'Mermeladas', stock: 10, reviews: [], quantity: 1 },
        { id: '2', name: 'Dulce de Leche Clásico', description: '...', price: 1230.50, imageUrl: 'https://placehold.co/600x600.png', category: 'Dulces y Pulpas', stock: 20, reviews: [], quantity: 1 },
    ]
  },
  { 
    id: "SALE-002", 
    customerInfo: { name: "Juan García", email: "juan.garcia@example.com", phone: "1122334455", address: "Avenida Siempreviva 742", city: "Springfield", zip: "12345" }, 
    date: "2023-10-27T11:30:00Z", 
    total: 1230.50, 
    status: "Procesando",
    items: []
  },
  { 
    id: "SALE-003", 
    customerInfo: { name: "Carlos Sanchez", email: "carlos.sanchez@example.com", phone: "1122334455", address: "Boulevard 456", city: "Shelbyville", zip: "67890" }, 
    date: "2023-10-27T14:00:00Z", 
    total: 8200.00, 
    status: "Completado",
    items: []
  },
  { 
    id: "SALE-004", 
    customerInfo: { name: "Luisa Fernandez", email: "luisa.fernandez@example.com", phone: "1122334455", address: "Calle del Roble 789", city: "Capital City", zip: "54321" }, 
    date: "2023-09-26T09:00:00Z", 
    total: 2500.00, 
    status: "Cancelado",
    items: []
  },
];
