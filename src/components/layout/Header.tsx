
"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { CartSheet } from "@/components/cart/CartSheet";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";

const STORE_NAME = "CorondaShop";

export default function Header() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`);
  }
  
  const clearSearch = () => {
    setSearchValue('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    router.push(`/?${params.toString()}`);
  }

  return (
    <>
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                {STORE_NAME}
              </Link>
              <nav className="hidden md:flex items-center gap-6 ml-8">
                <Link
                  href="/"
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  Tienda
                </Link>
                 <Link
                  href="/about"
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  Nosotros
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors mr-4"
                >
                  Contacto
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <form onSubmit={handleSearch} className="hidden sm:block relative w-40 md:w-52">
                <Input 
                  type="search" 
                  placeholder="Buscar productos..." 
                  className="pl-10 h-9"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                {searchValue && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"
                        onClick={clearSearch}
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>
                )}
              </form>

              <div className="flex items-center">
                 <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setIsCartOpen(true)}
                    aria-label="Abrir carrito"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {mounted && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                  
                  {!mounted ? (
                     <Button variant="ghost" size="icon" disabled>
                        <User className="h-6 w-6" />
                    </Button>
                  ) : user ? (
                     <Link href={user.isAdmin ? "/admin" : "/profile"}>
                       <Button variant="ghost" size="icon" aria-label="Mi Perfil">
                          <User className="h-6 w-6" />
                      </Button>
                     </Link>
                  ) : (
                    <Link href="/login">
                       <Button variant="ghost" size="icon" aria-label="Iniciar Sesión">
                          <User className="h-6 w-6" />
                      </Button>
                     </Link>
                  )}
                  
                   <div className="md:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Menú Principal</SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col space-y-4 mt-8">
                           <Link href="/" className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">Tienda</Link>
                           <Link href="/about" className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">Nosotros</Link>
                           <Link href="/contact" className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">Contacto</Link>
                           {!mounted ? null : user ? (
                             <>
                              <Link href={user.isAdmin ? "/admin" : "/profile"} className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">Mi Perfil</Link>
                              <button onClick={() => logout()} className="text-left text-lg font-medium text-destructive/80 hover:text-destructive transition-colors">Cerrar Sesión</button>
                             </>
                           ) : (
                             <Link href="/login" className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">Iniciar Sesión</Link>
                           )}
                        </nav>
                      </SheetContent>
                    </Sheet>
                   </div>
               </div>
            </div>
          </div>
        </div>
      </header>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
