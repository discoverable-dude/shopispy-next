"use client";

import { ScrapeResults } from "@/components/dashboard/ScrapeResults";
import { Store } from "lucide-react";

const Stores = () => {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-2">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tracked Stores
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-[44px]">
          View and analyse all your competitor store data in one place.
        </p>
      </div>

      {/* Main content */}
      <ScrapeResults />
    </div>
  );
};

export default Stores;
