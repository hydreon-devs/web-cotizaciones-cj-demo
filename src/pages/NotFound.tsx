import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-float mb-6">
          <FileQuestion className="h-24 w-24 mx-auto text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-6xl font-bold text-foreground animate-fade-in">
          404
        </h1>
        <p className="mb-6 text-xl text-muted-foreground animate-fade-in [animation-delay:200ms]">
          Oops! Página no encontrada
        </p>
        <div className="animate-fade-in [animation-delay:400ms]">
          <Button asChild>
            <Link to="/">
              Volver al Inicio
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground tracking-widest uppercase animate-fade-in [animation-delay:600ms]">
          CJ Producciones
        </p>
      </div>
    </div>
  );
};

export default NotFound;
