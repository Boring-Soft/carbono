import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Public Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold">CARBONO</span>
              <span className="text-xs text-muted-foreground">Bolivia</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#proyectos"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Proyectos
              </Link>
              <Link
                href="#departamentos"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Departamentos
              </Link>
              <Link
                href="#como-funciona"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cómo Funciona
              </Link>
              <Link
                href="#contacto"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contacto
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/dashboard/carbono">
                <Button variant="outline" size="sm">
                  Acceder al Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className="font-bold">CARBONO</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma Nacional de Monitoreo de Proyectos de Carbono en Bolivia
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Navegación</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#proyectos"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Proyectos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#departamentos"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Departamentos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#como-funciona"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cómo Funciona
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/dashboard/carbono"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard CARBONO
                  </Link>
                </li>
                <li>
                  <Link
                    href="/proyectos"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Gestión de Proyectos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/alertas"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Alertas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reportes"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reportes
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contacto"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Transparencia</h3>
              <p className="text-sm text-muted-foreground">
                Todos los datos de proyectos certificados son de acceso público
                para garantizar la transparencia en la gestión de carbono en Bolivia.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} CARBONO Bolivia. Plataforma Nacional
              de Monitoreo de Carbono.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
