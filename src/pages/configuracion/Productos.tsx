import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfiguracionProductos() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Productos</CardTitle>
        <CardDescription>Gestiona productos</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
