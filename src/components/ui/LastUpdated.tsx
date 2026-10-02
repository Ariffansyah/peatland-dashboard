"use client";

import { Clock } from "lucide-react";
import { formatTimestamp, formatRelativeTime, isDataStale } from "@/lib/constants";

interface LastUpdatedProps {
  timestamp: string;
  showRelative?: boolean;
}

export function LastUpdated({ timestamp, showRelative = false }: LastUpdatedProps) {
  const stale = isDataStale(timestamp);

  return (
    <div
      className={`last-update-badge${stale ? " stale-badge" : ""}`}
      aria-live="polite"
      title={stale ? "Data mungkin tidak terbaru" : "Data terkini"}
    >
      <Clock size={11} aria-hidden="true" />
      {showRelative ? (
        <span>
          {stale ? "Data terakhir " : "Update "}{formatRelativeTime(timestamp)}
        </span>
      ) : (
        <span>Last update: {formatTimestamp(timestamp)}</span>
      )}
    </div>
  );
}
