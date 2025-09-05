
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import type { Sale } from "@/lib/types";
import { SaleDetailDialog } from "./_components/SaleDetailDialog";
import { useToast } from "@/hooks/use-toast";
import { getCollection, deleteDocument } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

type SaleStatus = "Completado" | "Procesando" | "Cancelado";

const statusVariant: Record<SaleStatus, "default" | "secondary" | "destructive"> = {
    "Completado": "default",
    "Procesando": "secondary",
    "Cancelado": "destructive"
}


export default function AdminSalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const fetchedSales = await getCollection<Sale>("sales");
                setSales(fetchedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error("Error fetching sales:", error);
                toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las ventas." });
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [toast]);

    const handleRowClick = (sale: Sale) => {
        setSelectedSale(sale);
        setIsDialogOpen(true);
    }
    
    const handleDeleteSale = async (saleId: string) => {
        try {
            await deleteDocument("sales", saleId);
            const updatedSales = sales.filter(s => s.id !== saleId);
            setSales(updatedSales);
            toast({
                title: "Venta Eliminada",
                description: `La venta con ID ${saleId} ha sido eliminada.`,
            });
        } catch (error) {
            console.error("Error deleting sale:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la venta." });
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
            <h1 className="text-3xl font-bold">Ventas</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Ventas</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Venta</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map(sale => (
                                <TableRow key={sale.id} onClick={() => handleRowClick(sale)} className="cursor-pointer">
                                    <TableCell className="font-medium">{sale.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{sale.customerInfo?.name || "N/A"}</TableCell>
                                    <TableCell>{new Date(sale.date).toLocaleDateString('es-AR')}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[sale.status as SaleStatus]}>{sale.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {sales.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No se encontraron ventas.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <SaleDetailDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                sale={selectedSale}
                onDelete={handleDeleteSale}
            />
        </div>
    )
}
