// Empty file to overwrite the original one that exports a generic page
// Will be removed if it's already a real page, but let's check what was inside.
// Wait, not-found was imported in App.tsx. I should create it since I referenced it.
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-black font-heading text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button className="bg-primary text-white hover:bg-primary/90">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
