
"use client"

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect to login if not admin or not logged in, after the auth state has been confirmed.
    if (mounted && !loading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, router, mounted, loading]);

  const handleLogout = () => {
      logout();
      router.push('/');
  }
  
  // Render nothing or a loading spinner while auth state is being determined or redirecting.
  if (!mounted || loading || !user || !user.isAdmin) {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="bg-secondary/50">
        <SidebarProvider>
            <Sidebar aria-label="Navegación Principal">
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name || 'Admin'} />
                            <AvatarFallback>{getInitials(user.name || 'Admin')}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold">Admin Panel</span>
                            <span className="text-muted-foreground">CorondaShop</span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                                <Link href="/admin"><LayoutDashboard />Dashboard</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')}>
                                <Link href="/admin/products"><Package />Productos</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/users')}>
                                <Link href="/admin/users"><Users />Usuarios</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/sales')}>
                                <Link href="/admin/sales"><ShoppingCart />Ventas</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                                <Link href="/admin/settings"><Settings />Configuración</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout}>
                                <LogOut />Cerrar Sesión
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/">Volver a la tienda</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-4 md:hidden mb-4">
                        <SidebarTrigger />
                    </div>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
         <Toaster />
    </div>
  )
}
