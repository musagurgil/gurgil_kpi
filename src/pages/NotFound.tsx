import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="text-2xl text-muted-foreground">Sayfa Bulunamadı</p>
        <p className="text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Button onClick={() => navigate("/")} className="gap-2">
          <Home className="w-4 h-4" />
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
