import React from "react";
import { type Node } from "../types";

interface NodeLabelComponentProps {
  node: Node;
}

export const NodeLabelComponent: React.FC<NodeLabelComponentProps> = ({
  node,
}) => (
  <div className="p-1 flex flex-col bg-gray-100 bg-opacity-60 rounded-md text-xs text-gray-800">
    <span className="p-1 rounded">Address: {node.id}</span>
    <span className="p-1 rounded">Balance: {Math.trunc(node.valueActual)}</span>
  </div>
);
