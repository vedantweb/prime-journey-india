import { useEffect, useState } from 'react';
import { packages as staticPackages } from '../data/packages';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

export default function usePackagePrices() {
  const [packages, setPackages] = useState(staticPackages);

  useEffect(() => {
    let alive = true;

    fetch(`${API}/public/package-prices`)
      .then((res) => (res.ok ? res.json() : { packages: [] }))
      .then((data) => {
        if (!alive) return;

        const saved = {};
        (data.packages || []).forEach((item) => {
          saved[item.package_id] = item;
        });

        setPackages(
          staticPackages.map((pkg) => {
            const override = saved[pkg.id];

            if (!override) return pkg;

            return {
              ...pkg,
              priceFrom: Number(override.price_from),
              priceTo: Number(override.price_to),
            };
          })
        );
      })
      .catch(() => {
        // Keep original static prices if backend is unavailable.
      });

    return () => {
      alive = false;
    };
  }, []);

  return packages;
}
