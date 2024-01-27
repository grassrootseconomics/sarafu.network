import React from "react";
import { type Link, type Node } from "../types";

interface GraphStatisticsProps {
  nodes: Node[];
  links: Link[];
}

export const GraphStatistics: React.FC<GraphStatisticsProps> = ({
  nodes,
  links,
}) => (
  <div className="absolute bottom-2 right-2 z-10 text-sm text-gray-600">
    Addresses: <span>{nodes.length}</span> | Transactions:{" "}
    <span>{links.length}</span>
  </div>
);
