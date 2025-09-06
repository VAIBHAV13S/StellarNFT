import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <Card className="p-8 text-center max-w-md mx-4">
        <div className="mb-6">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-stellar bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-2 text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="space-y-4">
          <Button asChild className="btn-stellar w-full">
            <Link to="/">Return to Marketplace</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/mint">Create NFT</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
