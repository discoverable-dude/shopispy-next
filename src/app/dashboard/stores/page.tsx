"use client";

import { ScrapeResults } from "@/components/dashboard/ScrapeResults";

const Stores = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tracked Stores</h1>
        <p className="text-muted-foreground">
          View and analyze all your competitor store data
        </p>
      </div>

      <ScrapeResults />
    </div>
  );
};

export default Stores;
