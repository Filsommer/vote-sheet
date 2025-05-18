import Image from "next/image";
import RefreshButton from "../components/RefreshButton";
import RegionTabs from "../components/RegionTabs";
import { BarChartGradient } from "../components/BarChartGradient";
import { GithubIcon } from "lucide-react";

// Base region data (name and key)
const initialRegions = [
  { name: "Aveiro", territoryKey: "LOCAL-010000" },
  { name: "Beja", territoryKey: "LOCAL-020000" },
  { name: "Braga", territoryKey: "LOCAL-030000" },
  { name: "Bragança", territoryKey: "LOCAL-040000" },
  { name: "Castelo Branco", territoryKey: "LOCAL-050000" },
  { name: "Coimbra", territoryKey: "LOCAL-060000" },
  { name: "Évora", territoryKey: "LOCAL-070000" },
  { name: "Faro", territoryKey: "LOCAL-080000" },
  { name: "Guarda", territoryKey: "LOCAL-090000" },
  { name: "Leiria", territoryKey: "LOCAL-100000" },
  { name: "Lisboa", territoryKey: "LOCAL-110000" },
  { name: "Portalegre", territoryKey: "LOCAL-120000" },
  { name: "Porto", territoryKey: "LOCAL-130000" },
  { name: "Santarém", territoryKey: "LOCAL-140000" },
  { name: "Setúbal", territoryKey: "LOCAL-150000" },
  { name: "Viana do Castelo", territoryKey: "LOCAL-160000" },
  { name: "Vila Real", territoryKey: "LOCAL-170000" },
  { name: "Viseu", territoryKey: "LOCAL-180000" },
  { name: "Madeira", territoryKey: "LOCAL-300000" },
  { name: "Açores", territoryKey: "LOCAL-400000" },
];

const partyHexColors: { [key: string]: string } = {
  "PPD/PSD.CDS-PP.PPM": "#FFA500", // Orange for AD (using the common coalition acronym)
  "PPD/PSD.CDS-PP": "#FFA500", // Orange for AD (using the common coalition acronym)
  "PPD/PSD": "#FFA500", // Orange for AD (PSD standalone if it appears)
  AD: "#FFA500", // Orange for AD (generic AD if it appears)
  PS: "#f472b6", // Pink
  CH: "#00008B", // Dark Blue
  IL: "#7dd3fc", // Light Blue
  "PCP-PEV": "#60a5fa", // Normal Blue (CDU)
  L: "#90EE90", // Light Green (LIVRE)
  ADN: "#FFFF00", // Yellow
  "B.E.": "#FF0000", // Red
  PAN: "#008080", // Teal
  JPP: "#00FFFF", // Aqua/Cyan (for Aquateal)
  // Add more specific acronyms and their colors if needed
};
const fallbackColor = "#A9A9A9"; // Dark Gray for parties not in the map

interface PartyData {
  absoluteMajority: null | any;
  acronym: string;
  constituenctyCounter: number;
  imageKey: string;
  mandates: number;
  percentage: number;
  presidents: null | any;
  validVotesPercentage: number;
  votes: number;
}

interface ApiResponse {
  currentResults?: {
    resultsParty?: PartyData[];
    territoryFullName?: string;
    availableMandates?: number;
    totalMandates?: number;
    numberVoters?: number;
    subscribedVoters?: number;
  };
}

interface RegionInfo {
  name: string;
  territoryKey: string;
  mandatesForSim: number;
  attributedMandates: number;
  totalPhysicalMandates: number;
  numberVotersInRegion?: number;
  subscribedVotersInRegion?: number;
}

async function getRegionsWithMandates(
  baseRegions: Array<{ name: string; territoryKey: string }>
): Promise<RegionInfo[]> {
  let sumOfMandatesForSim_AllRegions = 0;
  let sumOfAttributedMandates_AllRegions = 0;
  let sumOfTotalPhysicalMandates_AllRegions = 0;
  let sumOfNumberVoters_AllRegions = 0;
  let sumOfSubscribedVoters_AllRegions = 0;

  const regionsWithMandatesPromises = baseRegions.map(async (region) => {
    try {
      const response = await fetch(
        `https://www.legislativas2025.mai.gov.pt/frontend/data/TerritoryResults?territoryKey=${region.territoryKey}&electionId=AR`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        console.error(`Failed to fetch mandate data for ${region.name}: ${response.status}`);
        return {
          ...region,
          mandatesForSim: 0,
          attributedMandates: 0,
          totalPhysicalMandates: 0,
          numberVotersInRegion: 0,
          subscribedVotersInRegion: 0,
        };
      }
      const data: ApiResponse = await response.json();
      const mandatesForSim = data.currentResults?.availableMandates || 0;
      const attributedMandatesInApi = data.currentResults?.totalMandates || 0;
      const totalPhysicalMandates = mandatesForSim + attributedMandatesInApi;
      const numberVotersInRegion = data.currentResults?.numberVoters || 0;
      const subscribedVotersInRegion = data.currentResults?.subscribedVoters || 0;

      return {
        ...region,
        mandatesForSim: mandatesForSim,
        attributedMandates: attributedMandatesInApi,
        totalPhysicalMandates: totalPhysicalMandates,
        numberVotersInRegion: numberVotersInRegion,
        subscribedVotersInRegion: subscribedVotersInRegion,
      };
    } catch (e) {
      console.error(`Error fetching mandate data for ${region.name}:`, e);
      return {
        ...region,
        mandatesForSim: 0,
        attributedMandates: 0,
        totalPhysicalMandates: 0,
        numberVotersInRegion: 0,
        subscribedVotersInRegion: 0,
      };
    }
  });

  const resolvedRegions = await Promise.all(regionsWithMandatesPromises);

  resolvedRegions.forEach((region) => {
    sumOfMandatesForSim_AllRegions += region.mandatesForSim;
    sumOfAttributedMandates_AllRegions += region.attributedMandates;
    sumOfTotalPhysicalMandates_AllRegions += region.totalPhysicalMandates;
    sumOfNumberVoters_AllRegions += region.numberVotersInRegion || 0;
    sumOfSubscribedVoters_AllRegions += region.subscribedVotersInRegion || 0;
  });

  // Sort by total physical mandates for tab order
  resolvedRegions.sort((a, b) => b.totalPhysicalMandates - a.totalPhysicalMandates);

  const totalRegionTab: RegionInfo = {
    name: "Total",
    territoryKey: "TOTAL",
    mandatesForSim: sumOfMandatesForSim_AllRegions,
    attributedMandates: sumOfAttributedMandates_AllRegions,
    totalPhysicalMandates: sumOfTotalPhysicalMandates_AllRegions,
    numberVotersInRegion: sumOfNumberVoters_AllRegions,
    subscribedVotersInRegion: sumOfSubscribedVoters_AllRegions,
  };

  return [totalRegionTab, ...resolvedRegions];
}

// Modify calculateMandatesForRegion: its 2nd param is the count for D'Hondt allocation
function calculateMandatesForRegion(
  regionParties: PartyData[],
  mandatesToRunDhondtOn: number, // This is effectively regionInfo.mandatesForSim
  regionYAxisLength: number = 20
): { [key: string]: number } {
  const regionalCellValues: Array<{ partyAcronym: string; divisor: number; value: number }> = [];
  const regionalYAxisNumbers = Array.from({ length: regionYAxisLength }, (_, i) => i + 1);

  regionParties.forEach((party) => {
    regionalYAxisNumbers.forEach((num) => {
      regionalCellValues.push({
        partyAcronym: party.acronym,
        divisor: num,
        value: party.votes / num,
      });
    });
  });
  regionalCellValues.sort((a, b) => b.value - a.value);
  const regionalAllocatedMandatesData = regionalCellValues.slice(0, mandatesToRunDhondtOn);
  const regionalMandatesByParty: { [key: string]: number } = {};
  regionalAllocatedMandatesData.forEach((cell) => {
    regionalMandatesByParty[cell.partyAcronym] =
      (regionalMandatesByParty[cell.partyAcronym] || 0) + 1;
  });
  return regionalMandatesByParty;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const enrichedRegions = await getRegionsWithMandates(initialRegions);
  const activeTerritoryKeyFromParam =
    typeof searchParams?.territoryKey === "string" ? searchParams.territoryKey : undefined;
  const activeTerritoryKey =
    activeTerritoryKeyFromParam ||
    (enrichedRegions.length > 0 ? enrichedRegions[0].territoryKey : "TOTAL");

  const isTotalViewActive = activeTerritoryKey === "TOTAL";

  let parties: PartyData[] = [];
  let territoryFullName = "";
  let mandatesForSimInCurrentView = 0;
  let attributedMandatesInCurrentView = 0;
  let totalPhysicalMandatesInCurrentView = 0;
  let yAxisLength = 20;

  // Declare these chart data sources outside the conditional blocks
  let totalTabChartDataSource: Array<{ key: string; value: number; color: string }> = [];
  let regionalDhondtBarChartData: Array<{ key: string; value: number; color: string }> = [];

  // Add state for voter stats in the current view
  let currentNumberVoters = 0;
  let currentSubscribedVoters = 0;

  const activeRegionDetailsFromTabs =
    enrichedRegions.find((r) => r.territoryKey === activeTerritoryKey) || enrichedRegions[0];

  if (isTotalViewActive) {
    territoryFullName = "Total (National Results)";
    mandatesForSimInCurrentView = activeRegionDetailsFromTabs?.mandatesForSim || 0;
    attributedMandatesInCurrentView = activeRegionDetailsFromTabs?.attributedMandates || 0;
    totalPhysicalMandatesInCurrentView = activeRegionDetailsFromTabs?.totalPhysicalMandates || 0;
    // Populate voter stats for Total view from the pre-aggregated RegionInfo
    currentNumberVoters = activeRegionDetailsFromTabs?.numberVotersInRegion || 0;
    currentSubscribedVoters = activeRegionDetailsFromTabs?.subscribedVotersInRegion || 0;

    const aggregatedTotalPhysicalMandatesByParty = new Map<string, number>();

    const allRegionDataPromises = initialRegions.map(async (region) => {
      try {
        const response = await fetch(
          `https://www.legislativas2025.mai.gov.pt/frontend/data/TerritoryResults?territoryKey=${region.territoryKey}&electionId=AR`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch data for ${region.name} (TOTAL view aggregation): ${response.status}`
          );
          return null;
        }
        const data: ApiResponse = await response.json();
        const currentRegionParties = data.currentResults?.resultsParty || [];
        const mandatesToRunDhondtOnThisRegion = data.currentResults?.availableMandates || 0;

        const simulatedMandatesInThisRegionByParty = calculateMandatesForRegion(
          currentRegionParties,
          mandatesToRunDhondtOnThisRegion
        );

        const allPartyAcronymsInThisRegion = new Set<string>();
        currentRegionParties.forEach((p) => allPartyAcronymsInThisRegion.add(p.acronym));
        Object.keys(simulatedMandatesInThisRegionByParty).forEach((p) =>
          allPartyAcronymsInThisRegion.add(p)
        );

        allPartyAcronymsInThisRegion.forEach((partyAcronym) => {
          const attributedInRegion =
            currentRegionParties.find((p) => p.acronym === partyAcronym)?.mandates || 0;
          const simulatedInRegion = simulatedMandatesInThisRegionByParty[partyAcronym] || 0;
          const totalPhysicalForPartyInRegion = attributedInRegion + simulatedInRegion;

          if (totalPhysicalForPartyInRegion > 0) {
            aggregatedTotalPhysicalMandatesByParty.set(
              partyAcronym,
              (aggregatedTotalPhysicalMandatesByParty.get(partyAcronym) || 0) +
                totalPhysicalForPartyInRegion
            );
          }
        });
        return data;
      } catch (error) {
        console.error(
          `Error fetching/processing data for ${region.name} (TOTAL view aggregation):`,
          error
        );
        return null;
      }
    });
    await Promise.all(allRegionDataPromises);

    totalTabChartDataSource = Array.from(aggregatedTotalPhysicalMandatesByParty.entries())
      .map(([key, value]) => ({ key, value, color: partyHexColors[key] || fallbackColor }))
      .sort((a, b) => b.value - a.value);

    parties = totalTabChartDataSource.map((item) => ({
      acronym: item.key,
      votes: 0,
      mandates: item.value,
      absoluteMajority: null,
      constituenctyCounter: 0,
      imageKey: "",
      percentage: 0,
      presidents: null,
      validVotesPercentage: 0,
    }));
  } else {
    // Logic for individual regions
    territoryFullName = activeRegionDetailsFromTabs?.name || "Unknown Region";
    mandatesForSimInCurrentView = activeRegionDetailsFromTabs?.mandatesForSim || 0;
    attributedMandatesInCurrentView = activeRegionDetailsFromTabs?.attributedMandates || 0;
    totalPhysicalMandatesInCurrentView = activeRegionDetailsFromTabs?.totalPhysicalMandates || 0;
    // Initialize voter stats from tab data (could be stale, will be updated)
    currentNumberVoters = activeRegionDetailsFromTabs?.numberVotersInRegion || 0;
    currentSubscribedVoters = activeRegionDetailsFromTabs?.subscribedVotersInRegion || 0;
    yAxisLength = 20;

    let freshResultsParty: PartyData[] = [];

    try {
      const response = await fetch(
        `https://www.legislativas2025.mai.gov.pt/frontend/data/TerritoryResults?territoryKey=${activeTerritoryKey}&electionId=AR`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        console.error(
          `Failed to fetch election data for ${activeTerritoryKey}:`,
          response.status,
          response.statusText
        );
      } else {
        const data: ApiResponse = await response.json();
        if (data.currentResults) {
          freshResultsParty = data.currentResults.resultsParty || [];
          parties = freshResultsParty;
          territoryFullName =
            data.currentResults.territoryFullName ||
            activeRegionDetailsFromTabs?.name ||
            "Unknown Region";
          const apiAvailableMandates = data.currentResults.availableMandates || 0;
          const apiAttributedMandates = data.currentResults.totalMandates || 0;
          mandatesForSimInCurrentView = apiAvailableMandates;
          attributedMandatesInCurrentView = apiAttributedMandates;
          totalPhysicalMandatesInCurrentView = apiAvailableMandates + apiAttributedMandates;
          // Update voter stats from fresh API data for the current region
          currentNumberVoters = data.currentResults.numberVoters || 0;
          currentSubscribedVoters = data.currentResults.subscribedVoters || 0;
        } else {
          console.error(
            `Election data for ${activeTerritoryKey} is not in the expected format:`,
            data
          );
        }
      }
    } catch (error) {
      console.error(`Error fetching or processing election data for ${activeTerritoryKey}:`, error);
    }

    const simulatedMandatesByParty: { [key: string]: number } = calculateMandatesForRegion(
      freshResultsParty,
      mandatesForSimInCurrentView
    );

    const finalMandatesForBarChart = new Map<string, number>();
    const allPartyAcronymsInRegion = new Set<string>();

    freshResultsParty.forEach((party) => {
      finalMandatesForBarChart.set(
        party.acronym,
        (finalMandatesForBarChart.get(party.acronym) || 0) + (party.mandates || 0)
      );
      allPartyAcronymsInRegion.add(party.acronym);
    });

    for (const [partyAcronym, numSimulatedMandates] of Object.entries(simulatedMandatesByParty)) {
      finalMandatesForBarChart.set(
        partyAcronym,
        (finalMandatesForBarChart.get(partyAcronym) || 0) + numSimulatedMandates
      );
      allPartyAcronymsInRegion.add(partyAcronym);
    }

    regionalDhondtBarChartData = Array.from(allPartyAcronymsInRegion)
      .map((acronym) => ({
        key: acronym,
        value: finalMandatesForBarChart.get(acronym) || 0,
        color: partyHexColors[acronym] || fallbackColor,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  // <<< START DEBUG LOGGING >>>
  if (!isTotalViewActive && activeTerritoryKey === "LOCAL-090000") {
    console.log(`DEBUG Guarda (LOCAL-090000) - Post Chart Data Calc:`);
    console.log(`  mandatesForSimInCurrentView: ${mandatesForSimInCurrentView}`);
    console.log(`  attributedMandatesInCurrentView: ${attributedMandatesInCurrentView}`);
    console.log(`  totalPhysicalMandatesInCurrentView: ${totalPhysicalMandatesInCurrentView}`);
    console.log(`  regionalDhondtBarChartData:`, regionalDhondtBarChartData);
  }
  // <<< END DEBUG LOGGING >>>

  const yAxisNumbers = Array.from({ length: yAxisLength }, (_, i) => i + 1);
  interface CellValue {
    partyAcronym: string;
    divisor: number;
    value: number;
  }
  const allCellValues: CellValue[] = [];
  if (!isTotalViewActive) {
    parties.forEach((party) => {
      yAxisNumbers.forEach((num) => {
        allCellValues.push({ partyAcronym: party.acronym, divisor: num, value: party.votes / num });
      });
    });
    allCellValues.sort((a, b) => b.value - a.value);
  }

  const cellStyles = new Map<string, string>();
  const simulatedQuotientsForAtRiskSummary = allCellValues.slice(0, mandatesForSimInCurrentView);

  if (!isTotalViewActive) {
    // Styling for mandate cells (up to totalPhysicalMandatesInCurrentView)
    const mandateCellQuotients = allCellValues.slice(0, totalPhysicalMandatesInCurrentView);

    mandateCellQuotients.forEach((cell, index) => {
      let bgColorClass = "";

      // Determine base green color
      if (index < attributedMandatesInCurrentView) {
        // These are the API-attributed mandates, considered "finalized"
        bgColorClass = "bg-green-800 text-white"; // Dark green for finalized
      } else {
        // These are either simulated or part of the remaining physical mandates
        bgColorClass = "bg-green-600 text-white"; // Standard green for others
      }

      // Pulsing logic: only for the last 1 or 2 *simulated* mandates
      // and only if mandates are actually being simulated.
      if (mandatesForSimInCurrentView > 0) {
        // Calculate the indices within the overall 'allCellValues' that correspond to simulated mandates.
        // Simulated mandates start conceptually *after* attributed ones.
        // However, allCellValues is sorted purely by quotient value.
        // We need to identify which of the top `totalPhysicalMandatesInCurrentView` cells
        // are also part of the `mandatesForSimInCurrentView` if D'Hondt were run only on available votes.
        // This is tricky because `allCellValues` mixes votes that might fill attributed vs. simulated slots.

        // Simpler approach for pulsing: Pulse the cells at overall index
        // `totalPhysicalMandatesInCurrentView - 1` and `totalPhysicalMandatesInCurrentView - 2`
        // IF these positions are also within the range of SIMULATED mandates when counted from the start of simulation.
        // The simulation effectively starts allocating from the `attributedMandatesInCurrentView`-th mandate slot onwards,
        // up to `attributedMandatesInCurrentView + mandatesForSimInCurrentView -1`.

        const lastSimulatedMandateOverallIndex =
          attributedMandatesInCurrentView + mandatesForSimInCurrentView - 1;
        const secondLastSimulatedMandateOverallIndex =
          attributedMandatesInCurrentView + mandatesForSimInCurrentView - 2;

        // Check if the current cell (by its overall index 'index' among mandateCellQuotients)
        // corresponds to one of these last simulated positions.
        if (
          index === lastSimulatedMandateOverallIndex ||
          (mandatesForSimInCurrentView > 1 && index === secondLastSimulatedMandateOverallIndex)
        ) {
          // Ensure this cell is actually within the range of total physical mandates before pulsing
          if (index < totalPhysicalMandatesInCurrentView) {
            bgColorClass += " animate-pulse-fast-contrast";
          }
        }
      }
      cellStyles.set(`${cell.partyAcronym}-${cell.divisor}`, bgColorClass);
    });

    // Grey "Contender" cell styling (at totalPhysicalMandatesInCurrentView and +1)
    const contenderBaseIndex = totalPhysicalMandatesInCurrentView;
    const contenderStyle = "bg-zinc-300 text-black";
    const pulsingContenderStyle = contenderStyle + " animate-pulse-fast-contrast";

    if (allCellValues.length > contenderBaseIndex) {
      const contender1 = allCellValues[contenderBaseIndex];
      cellStyles.set(
        `${contender1.partyAcronym}-${contender1.divisor}`,
        mandatesForSimInCurrentView > 0 ? pulsingContenderStyle : contenderStyle
      );
    }
    if (allCellValues.length > contenderBaseIndex + 1) {
      const contender2 = allCellValues[contenderBaseIndex + 1];
      cellStyles.set(
        `${contender2.partyAcronym}-${contender2.divisor}`,
        mandatesForSimInCurrentView > 0 ? pulsingContenderStyle : contenderStyle
      );
    }
  }

  const numPartiesInChart = isTotalViewActive
    ? totalTabChartDataSource.length
    : regionalDhondtBarChartData.length;
  const heightClasses: { [key: number]: string } = {
    1: "h-32",
    2: "h-40",
    3: "h-48",
    4: "h-56",
    5: "h-64",
    6: "h-72",
    7: "h-80",
    8: "h-96",
    9: "h-96",
    10: "h-96",
    11: "h-96",
    12: "h-96",
  };
  const dynamicBarChartHeightClass =
    heightClasses[Math.min(12, Math.max(1, numPartiesInChart))] || "h-96";

  const contenderIndex1 = totalPhysicalMandatesInCurrentView;
  const contenderIndex2 = totalPhysicalMandatesInCurrentView + 1;

  // Calculate turnout for display
  const turnoutPercentage =
    currentSubscribedVoters > 0
      ? ((currentNumberVoters / currentSubscribedVoters) * 100).toFixed(2)
      : "N/A";

  return (
    <div className="min-h-screen p-4 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-7xl mx-auto p-2 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-800">
          Legislativas 2025 - Vote Allocation
        </h1>
        {/* Sub-header for voter stats */}
        <div className="text-center text-sm text-gray-600 mb-6 sm:mb-8">
          <span>Voters: {currentNumberVoters.toLocaleString()}</span>
          <span className="mx-2">|</span>
          <span>Subscribed: {currentSubscribedVoters.toLocaleString()}</span>
          <span className="mx-2">|</span>
          <span>
            Turnout: {turnoutPercentage}
            {turnoutPercentage !== "N/A" ? "%" : ""}
          </span>
        </div>
        <RegionTabs
          regions={enrichedRegions.map((r) => ({ ...r, displayMandates: r.totalPhysicalMandates }))}
          activeTerritoryKey={activeTerritoryKey}
        />

        {isTotalViewActive ? (
          <div className="my-8 p-3 sm:p-4 border border-gray-300 rounded-lg shadow bg-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start items-center mb-6 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
                {territoryFullName} ({totalPhysicalMandatesInCurrentView} Mandates Nationally)
              </h2>
              <RefreshButton />
            </div>
            <div className="max-w-2xl mx-auto">
              <BarChartGradient
                data={totalTabChartDataSource}
                height={dynamicBarChartHeightClass}
              />
              <p className="text-xs text-gray-600 mt-2 text-center">
                Chart shows total physical mandates (API-attributed + simulated) obtained by each
                party across all regions. This sums to {totalPhysicalMandatesInCurrentView} total
                mandates nationally.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 p-3 sm:p-4 border border-gray-300 rounded-lg shadow bg-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start items-center mb-4 gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                  Vote Allocation Summary: <br className="sm:hidden" /> {territoryFullName} (
                  {totalPhysicalMandatesInCurrentView - mandatesForSimInCurrentView}/
                  {totalPhysicalMandatesInCurrentView} allocated)
                </h2>
                <RefreshButton />
              </div>
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                <div className="lg:w-7/12 w-full">
                  <div className="max-w-[500px] mx-auto lg:mx-0">
                    <BarChartGradient
                      data={regionalDhondtBarChartData}
                      height={dynamicBarChartHeightClass}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center lg:text-left">
                    These {mandatesForSimInCurrentView} mandates are distributed based on
                    D&apos;Hondt. The remaining {attributedMandatesInCurrentView} mandates for this
                    region were pre-assigned.
                  </p>
                </div>
                <div className="lg:w-5/12 w-full mt-4 sm:mt-8 lg:mt-0 space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-700">
                      Next Highest Quotients (after all {totalPhysicalMandatesInCurrentView}{" "}
                      physical mandates):
                    </h3>
                    {allCellValues.length > contenderIndex1 ? (
                      <ul className="list-disc pl-5 text-sm sm:text-base text-gray-600 space-y-1">
                        {allCellValues[contenderIndex1] && (
                          <li>
                            <span className="font-semibold">
                              {" "}
                              {allCellValues[contenderIndex1].partyAcronym}{" "}
                            </span>{" "}
                            (Votes / {allCellValues[contenderIndex1].divisor}):{" "}
                            {allCellValues[contenderIndex1].value.toFixed(2)}
                          </li>
                        )}
                        {allCellValues.length > contenderIndex2 &&
                          allCellValues[contenderIndex2] && (
                            <li>
                              <span className="font-semibold">
                                {" "}
                                {allCellValues[contenderIndex2].partyAcronym}{" "}
                              </span>{" "}
                              (Votes / {allCellValues[contenderIndex2].divisor}):{" "}
                              {allCellValues[contenderIndex2].value.toFixed(2)}
                            </li>
                          )}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm sm:text-base">
                        {mandatesForSimInCurrentView === 0
                          ? "No mandates were available for simulation."
                          : "No further quotients to display."}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-700">Two Parties at Risk:</h3>
                    {mandatesForSimInCurrentView > 0 &&
                    simulatedQuotientsForAtRiskSummary.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm sm:text-base text-gray-600 space-y-1">
                        {simulatedQuotientsForAtRiskSummary.length >= 2 &&
                          simulatedQuotientsForAtRiskSummary[
                            simulatedQuotientsForAtRiskSummary.length - 2
                          ] && (
                            <li>
                              <span className="font-semibold">
                                {" "}
                                {
                                  simulatedQuotientsForAtRiskSummary[
                                    simulatedQuotientsForAtRiskSummary.length - 2
                                  ].partyAcronym
                                }{" "}
                              </span>
                              (Votes /{" "}
                              {
                                simulatedQuotientsForAtRiskSummary[
                                  simulatedQuotientsForAtRiskSummary.length - 2
                                ].divisor
                              }
                              ):
                              {simulatedQuotientsForAtRiskSummary[
                                simulatedQuotientsForAtRiskSummary.length - 2
                              ].value.toFixed(2)}
                            </li>
                          )}
                        {simulatedQuotientsForAtRiskSummary[
                          simulatedQuotientsForAtRiskSummary.length - 1
                        ] && (
                          <li>
                            <span className="font-semibold">
                              {" "}
                              {
                                simulatedQuotientsForAtRiskSummary[
                                  simulatedQuotientsForAtRiskSummary.length - 1
                                ].partyAcronym
                              }{" "}
                            </span>
                            (Votes /{" "}
                            {
                              simulatedQuotientsForAtRiskSummary[
                                simulatedQuotientsForAtRiskSummary.length - 1
                              ].divisor
                            }
                            ):
                            {simulatedQuotientsForAtRiskSummary[
                              simulatedQuotientsForAtRiskSummary.length - 1
                            ].value.toFixed(2)}
                            {simulatedQuotientsForAtRiskSummary.length === 1 && (
                              <span className="text-gray-500 italic">
                                {" "}
                                (Only one mandate allocated in simulation){" "}
                              </span>
                            )}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm sm:text-base">
                        {" "}
                        {mandatesForSimInCurrentView === 0
                          ? "No mandates were simulated."
                          : "No mandates allocated in simulation."}{" "}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Divisor
                    </th>
                    {parties.map((party) => {
                      const color = partyHexColors[party.acronym] || fallbackColor;
                      return (
                        <th
                          key={party.acronym}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300 whitespace-nowrap relative"
                          style={{ borderBottomWidth: "4px", borderBottomColor: color }}
                        >
                          {party.acronym}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yAxisNumbers.map((num) => (
                    <tr key={num}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                        {num}
                      </td>
                      {parties.map((party) => (
                        <td
                          key={`${party.acronym}-${num}`}
                          className={`px-6 py-4 whitespace-nowrap text-sm border border-gray-300 ${
                            cellStyles.get(`${party.acronym}-${num}`) || "text-gray-500"
                          }`}
                        >
                          {(party.votes / num).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {parties.length === 0 && !isTotalViewActive && (
                    <tr>
                      <td
                        colSpan={1}
                        className="px-6 py-12 text-center text-sm text-gray-500 border border-gray-300"
                      >
                        No party data available for the selected region or an error occurred.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      <footer className="flex gap-[24px] flex-wrap items-center justify-center pt-10">
        <a
          className="flex items-center gap-1.5 hover:underline hover:underline-offset-4"
          href="https://github.com/FelixSommer/rosen-charts-expo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon aria-hidden width={16} height={16} />
          GitHub
        </a>
      </footer>
    </div>
  );
}
