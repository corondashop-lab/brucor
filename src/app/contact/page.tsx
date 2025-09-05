
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Mail, Phone } from "lucide-react";
import Link from "next/link";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16.6,14.2l-1.5-0.8c-0.5-0.3-0.8-0.1-1.1,0.2l-0.6,0.7c-0.2,0.2-0.5,0.3-0.8,0.2C11.3,14,10,12.7,9.5,11.3c-0.1-0.3,0-0.6,0.2-0.8l0.7-0.6c0.3-0.3,0.4-0.6,0.2-1.1l-0.8-1.5C9.6,7,9.3,6.8,9,6.8H7.7c-0.5,0-1,0.2-1.3,0.5c-0.3,0.3-0.6,0.7-0.6,1.2c0,0.1,0,0.2,0,0.2c0.1,0.7,0.3,1.4,0.7,2.1c0.8,1.6,2,3.2,3.8,4.5c0.5,0.3,1,0.7,1.5,0.9c0.7,0.3,1.4,0.3,2.1,0.2c0.1,0,0.2,0,0.2,0c0.5-0.1,0.9-0.3,1.2-0.6c0.3-0.3,0.5-0.8,0.5-1.3V15C17.2,14.7,17,14.4,16.6,14.2z M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20.5c-4.7,0-8.5-3.8-8.5-8.5S7.3,3.5,12,3.5s8.5,3.8,8.5,8.5S16.7,20.5,12,20.5z"></path></svg>
)

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario.
    // Por ahora, solo es una demo visual.
    alert("Formulario enviado (simulación). ¡Gracias por contactarnos!");
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ponte en Contacto
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            ¿Tienes alguna pregunta o quieres saber más sobre nuestros productos? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Columna Izquierda: Formulario y Datos */}
          <div className="space-y-10">
            {/* Formulario de contacto */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Envíanos un Mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre completo" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" placeholder="tu@email.com" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" placeholder="Escribe tu consulta aquí..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">Enviar Mensaje</Button>
              </form>
            </div>
            
            {/* Datos de contacto y redes */}
            <div className="space-y-6">
               <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Datos de Contacto</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <a href="mailto:contactocorondashop@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                      <Mail className="w-5 h-5"/>
                      <span>contactocorondashop@gmail.com</span>
                    </a>
                    <a href="tel:+543425123456" className="flex items-center gap-3 hover:text-primary transition-colors">
                      <Phone className="w-5 h-5"/>
                      <span>+54 342 512-3456</span>
                    </a>
                  </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Síguenos en Redes</h3>
                <div className="flex space-x-4">
                    <Link href="https://wa.me/543424276932" target="_blank" aria-label="WhatsApp">
                        <WhatsAppIcon className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" />
                    </Link>
                    <Link href="https://www.instagram.com/brucorcoronda" target="_blank" aria-label="Instagram">
                        <Instagram className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" />
                    </Link>
                     <Link href="https://www.facebook.com/brucorCoronda" target="_blank" aria-label="Facebook">
                        <FacebookIcon className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" />
                    </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mapa */}
          <div className="h-[400px] md:h-full w-full rounded-lg overflow-hidden shadow-lg border">
            {/* Reemplaza esta URL por la de tu ubicación en Google Maps */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2887.17532244487!2d-60.93685632492637!3d-31.953620922426904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b5bfbb3266ac8f%3A0x9f32545d29749949!2sBrucor!5e1!3m2!1ses-419!2sar!4v1755849833038!5m2!1ses-419!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de la empresa"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
