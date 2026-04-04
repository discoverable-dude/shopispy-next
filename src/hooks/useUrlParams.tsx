"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface UrlParams {
  site?: string;
  url?: string;
  store?: string;
}

export function useUrlParams() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<UrlParams>({});

  useEffect(() => {
    const newParams: UrlParams = {};

    // Check for various parameter names for the site URL
    const site = searchParams.get('site') || searchParams.get('url') || searchParams.get('store');
    if (site) {
      newParams.site = site;
    }

    setParams(newParams);
  }, [searchParams]);

  const clearParams = () => {
    router.replace(pathname);
  };

  const updateParams = (newParams: Partial<UrlParams>) => {
    const updatedSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        updatedSearchParams.set(key, value);
      } else {
        updatedSearchParams.delete(key);
      }
    });

    router.replace(`${pathname}?${updatedSearchParams.toString()}`);
  };

  return {
    params,
    clearParams,
    updateParams,
    hasSiteParam: !!params.site
  };
}
