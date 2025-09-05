
"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import Link from "next/link";
import type { SliderItem } from "@/lib/types";
import Autoplay from "embla-carousel-autoplay";

interface ProductSliderProps {
  items: SliderItem[];
}

export function ProductSlider({ items }: ProductSliderProps) {
  
  if (items.length === 0) {
    return null;
  }

  return (
    <Carousel 
      className="w-full max-w-7xl mx-auto"
      opts={{ loop: true }}
      plugins={[
        Autoplay({
          delay: 10000,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.id}>
            <div className="relative w-full aspect-video lg:h-[60vh] rounded-lg overflow-hidden bg-secondary/30">
              <Image
                src={item.imageUrl as string}
                alt={item.name}
                fill
                className="object-cover"
                data-ai-hint="featured content"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
                <h2 className="text-3xl md:text-5xl font-bold text-white max-w-2xl drop-shadow-lg">{item.name}</h2>
                <p className="text-lg text-white/80 mt-2 max-w-2xl hidden sm:block drop-shadow-md">{item.description}</p>
                {'price' in item && (
                    <Button asChild className="mt-6 w-fit text-lg py-6 px-8">
                        <Link href={`/products/${item.id}`}>Ver Producto</Link>
                    </Button>
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex left-4" />
      <CarouselNext className="hidden sm:flex right-4" />
    </Carousel>
  );
}
