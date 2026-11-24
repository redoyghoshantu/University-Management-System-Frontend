import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <Compass className="mx-auto size-12 text-primary" />
        <p className="font-serif text-6xl font-semibold">404</p>
        <h1 className="text-xl font-semibold">This page wandered off campus</h1>
        <p className="text-sm text-muted-foreground">The page you are looking for does not exist, or you do not have access to it.</p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
