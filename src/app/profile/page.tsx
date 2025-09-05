
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Sale } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SaleDetailDialog } from "./_components/SaleDetailDialog";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { findSalesByUserId } from "@/lib/firebase";

type SaleStatus = "Completado" | "Procesando" | "Cancelado";

const statusVariant: Record<SaleStatus, "default" | "secondary" | "destructive"> = {
    "Completado": "default",
    "Procesando": "secondary",
    "Cancelado": "destructive"
}


export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    const fetchUserSales = async () => {
        if (user) {
            setLoading(true);
            try {
                const userSales = await findSalesByUserId(user.id);
                // Sort sales by date client-side after fetching
                setSales(userSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error("Failed to fetch user sales:", error);
            } finally {
                setLoading(false);
            }
        }
    }
    fetchUserSales();
  }, [user]);

  if (authLoading || !user) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handleRowClick = (sale: Sale) => {
      setSelectedSale(sale);
      setIsDialogOpen(true);
  }

  return (
    <>
    <div className="container mx-auto max-w-4xl py-12 space-y-8">
      <Card>
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24 text-3xl">
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
            </div>
          <CardTitle className="text-3xl">{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={handleLogout} variant="destructive">
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Mi Historial de Compras</CardTitle>
            <CardDescription>Aquí puedes ver todos los pedidos que has realizado.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : sales.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Pedido</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.map(sale => (
                            <TableRow key={sale.id} onClick={() => handleRowClick(sale)} className="cursor-pointer">
                                <TableCell className="font-mono text-xs">{sale.id.slice(0, 8)}...</TableCell>
                                <TableCell>{new Date(sale.date).toLocaleDateString('es-AR')}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[sale.status as SaleStatus]}>{sale.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">${sale.total.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aún no has realizado ninguna compra.</p>
                    <Button variant="link" asChild><Link href="/">Ir a la tienda</Link></Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
    <SaleDetailDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        sale={selectedSale}
    />
    </>
  );
}
