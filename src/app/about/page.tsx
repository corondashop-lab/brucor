
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { HeartHandshake, Loader2 } from "lucide-react";
import type { AboutData } from "@/lib/types";
import { getDocument } from "@/lib/firebase";

const defaultAboutData: AboutData = {
  id: 'main-about-us',
  title: "Nuestra Esencia",
  text: "Desde nuestra historia familiar, tejemos calidad y autenticidad en cada producto. Creemos en cuidar a las personas y al planeta, ofreciendo soluciones que inspiran confianza. Nos guían la responsabilidad, la innovación y un compromiso sincero con nuestra comunidad.",
  imageUrl: "https://placehold.co/600x600.png",
  imageHint: "craftsmanship teamwork",
  highlight: "Calidad, Compromiso, Comunidad.",
};

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedData = await getDocument<AboutData>("settings", "aboutUs");
        if (fetchedData) {
          setAboutData(fetchedData);
        }
      } catch (error) {
        console.error("Error fetching about page data, using default.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) {
    return (
       <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin" />
       </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              {aboutData.title}
            </h1>
            <div className="w-16 h-1 bg-primary mb-6"></div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {aboutData.text}
            </p>
            <div className="flex items-center text-primary mt-8">
              <HeartHandshake className="h-6 w-6 mr-3" />
              <span className="font-semibold">{aboutData.highlight}</span>
            </div>
          </div>
          <div className="order-1 md:order-2 aspect-square relative rounded-lg overflow-hidden shadow-lg">
            <Image
              src={aboutData.imageUrl as string}
              alt="Sobre Nosotros"
              fill
              className="object-cover"
              data-ai-hint={aboutData.imageHint}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

    