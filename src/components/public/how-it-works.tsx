import { Card, CardContent } from "@/components/ui/card";
import { FileText, Satellite, CheckCircle, DollarSign } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "1. Registro",
    description:
      "Las organizaciones registran sus proyectos de conservación o captura de carbono en la plataforma.",
  },
  {
    icon: Satellite,
    title: "2. Verificación Satelital",
    description:
      "Utilizamos Google Earth Engine para verificar la cobertura forestal y calcular la captura de CO₂.",
  },
  {
    icon: CheckCircle,
    title: "3. Certificación",
    description:
      "Los proyectos verificados reciben certificación y son publicados en el portal de transparencia.",
  },
  {
    icon: DollarSign,
    title: "4. Monetización",
    description:
      "Los proyectos certificados pueden acceder al mercado de carbono y generar ingresos sostenibles.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Proceso simple y transparente para proyectos de carbono
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center relative">
                <CardContent className="pt-12 pb-8">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="p-4 bg-green-600 rounded-full text-white shadow-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
