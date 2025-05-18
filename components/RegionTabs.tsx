"use client";

import { useRouter } from "next/navigation";

// This interface should now match the structure passed from app/page.tsx
interface RegionTabItem {
  name: string;
  territoryKey: string;
  // displayMandates was previously simulatableMandates, now it's totalPhysicalMandates
  displayMandates: number; // This will be region.totalPhysicalMandates
  // We might still need these if we want to show more details in the future, but not for the current label
  // mandatesForSim: number;
  // attributedMandates: number;
}

interface RegionTabsProps {
  regions: RegionTabItem[];
  activeTerritoryKey: string;
}

export default function RegionTabs({ regions, activeTerritoryKey }: RegionTabsProps) {
  const router = useRouter();

  const handleTabClick = (territoryKey: string) => {
    router.push(`/?territoryKey=${territoryKey}`);
  };

  if (!regions || regions.length === 0) {
    return <div className="mb-6 text-center text-gray-500">No regions to display.</div>;
  }

  return (
    <div className="mb-6 border-b border-gray-300">
      <nav className="-mb-px flex space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
        {regions.map((region) => (
          <button
            key={region.territoryKey}
            onClick={() => handleTabClick(region.territoryKey)}
            className={`whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm 
              ${
                activeTerritoryKey === region.territoryKey
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            focus:outline-none rounded-t-md transition-colors duration-150 ease-in-out`}
            aria-current={activeTerritoryKey === region.territoryKey ? "page" : undefined}
          >
            {/* The label now uses displayMandates, which is totalPhysicalMandates */}
            {region.name} ({region.displayMandates})
          </button>
        ))}
      </nav>
    </div>
  );
}
