import { Database as DatabaseIcon, Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Database = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Base de Datos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las tablas principales y accede a los CRUD disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DatabaseIcon className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-lg">Servicios</CardTitle>
              <CardDescription>
                Administra el catálogo de servicios disponibles para tus cotizaciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/servicios">
                <Button className="w-full">Ir a servicios</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Boxes className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-lg">Productos</CardTitle>
              <CardDescription>
                Gestiona los productos asociados a cada servicio para armar cotizaciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/productos">
                <Button className="w-full">Ir a productos</Button>
              </Link>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default Database;
