"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const organizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  type: z.string().min(1, "Selecciona un tipo de organizacion"),
  contactEmail: z.string().email("Email invalido").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof organizationSchema>;

export function OrganizationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      type: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear organizacion");
      }

      toast.success("Organizacion creada exitosamente");
      router.push("/organizaciones");
      router.refresh();
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear organizacion");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Organizacion</CardTitle>
        <CardDescription>
          Ingresa los datos de la organizacion responsable del proyecto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Organizacion *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Comunidad Indigena Tacana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Organizacion *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Community">Comunidad Indigena</SelectItem>
                      <SelectItem value="NGO">ONG</SelectItem>
                      <SelectItem value="Government">Gobierno Local</SelectItem>
                      <SelectItem value="Private">Empresa Privada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contacto</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contacto@organizacion.bo"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email principal para comunicaciones
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="+591 2 1234567" {...field} />
                  </FormControl>
                  <FormDescription>
                    Numero telefonico de la organizacion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direccion</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Direccion completa de la sede principal"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ubicacion de la sede u oficina principal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Crear Organizacion"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
