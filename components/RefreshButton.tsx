"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          if (!isRefreshing) {
            // Prevent multiple refreshes if router.refresh() is slow
            setIsRefreshing(true);
            router.refresh();
            // setIsRefreshing will be reset after refresh completes and component re-initializes or via a timeout
            setTimeout(() => setIsRefreshing(false), 2000); // Reset refreshing state after a delay
          }
          return 10; // Reset countdown
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [router, isRefreshing]);

  const handleRefreshClick = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      router.refresh();
      setCountdown(10); // Reset countdown immediately on click
      setTimeout(() => setIsRefreshing(false), 2000); // Reset refreshing state after a delay
    }
  };

  return (
    <button
      onClick={handleRefreshClick}
      disabled={isRefreshing}
      className="flex items-center px-3 py-1.5 text-sm bg-zinc-950 hover:bg-zinc-800 transition-colors text-white rounded-md disabled:opacity-70"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1.5 animate-spin"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      {isRefreshing ? "Refreshing..." : `Refreshing in ${countdown}s`}
    </button>
  );
}
