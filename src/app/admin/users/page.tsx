
"use client"

import { useEffect, useState } from "react";
import type { StoredUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCollection } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<StoredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await getCollection<StoredUser>("users");
                setUsers(fetchedUsers);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los usuarios."});
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [toast]);
    
    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
            <h1 className="text-3xl font-bold">Usuarios Registrados</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Todos los usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Verificado</TableHead>
                                <TableHead>ID de Usuario</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.filter(u => !u.isAdmin).map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.isVerified ? 'Sí' : 'No'}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">{user.id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
