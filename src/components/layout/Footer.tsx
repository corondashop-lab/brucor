
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import Link from "next/link";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16.6,14.2l-1.5-0.8c-0.5-0.3-0.8-0.1-1.1,0.2l-0.6,0.7c-0.2,0.2-0.5,0.3-0.8,0.2C11.3,14,10,12.7,9.5,11.3c-0.1-0.3,0-0.6,0.2-0.8l0.7-0.6c0.3-0.3,0.4-0.6,0.2-1.1l-0.8-1.5C9.6,7,9.3,6.8,9,6.8H7.7c-0.5,0-1,0.2-1.3,0.5c-0.3,0.3-0.6,0.7-0.6,1.2c0,0.1,0,0.2,0,0.2c0.1,0.7,0.3,1.4,0.7,2.1c0.8,1.6,2,3.2,3.8,4.5c0.5,0.3,1,0.7,1.5,0.9c0.7,0.3,1.4,0.3,2.1,0.2c0.1,0,0.2,0,0.2,0c0.5-0.1,0.9-0.3,1.2-0.6c0.3-0.3,0.5-0.8,0.5-1.3V15C17.2,14.7,17,14.4,16.6,14.2z M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20.5c-4.7,0-8.5-3.8-8.5-8.5S7.3,3.5,12,3.5s8.5,3.8,8.5,8.5S16.7,20.5,12,20.5z"></path></svg>
)
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);


const STORE_NAME = "CorondaShop";

export default function Footer() {
  return (
    <footer id="contact" className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold">{STORE_NAME}</h3>
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {STORE_NAME}. Todos los derechos reservados.
                </p>
            </div>
          
          <div className="flex items-center space-x-1">
             <Button variant="ghost" size="icon" asChild>
              <Link href="https://wa.me/543424276932" aria-label="WhatsApp" target="_blank">
                <WhatsAppIcon className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://www.instagram.com/brucorcoronda" aria-label="Instagram" target="_blank">
                <Instagram className="h-5 w-5" />
              </Link>
            </Button>
             <Button variant="ghost" size="icon" asChild>
                <Link href="https://www.facebook.com/brucorCoronda" target="_blank" aria-label="Facebook">
                    <FacebookIcon className="h-5 w-5" />
                </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
