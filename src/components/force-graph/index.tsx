"use client"
import { type ForceManyBody, type SimulationNodeDatum } from "d3-force";
import { ExpandIcon, ShrinkIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import ForceGraph2D, {
  type ForceGraphMethods,
  type NodeObject,
} from "react-force-graph-2d";
import { Button } from "../ui/button";
import { NodeLabelComponent } from "./components/node-label";
import { useGraphData } from "./hooks/useGraphData";
import { type Link, type Node } from "./types";
import { toast } from "sonner";
// Component for rendering the Force Graph
export function VoucherForceGraph({
  voucherAddress,
}: {
  voucherAddress: `0x${string}`;
}) {
  const graphData = useGraphData(voucherAddress);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null); // New state for hovered node
  // Function to handle node hover
  const handleNodeHover = (node: NodeObject<Node> | null) => {
    setHoveredNode(node);
  };
  const handleNodeClick = (node: NodeObject<Node>) => {
    console.log("Clicked node address:", node.id);
    void navigator.clipboard.writeText(node.id).then(() => {
        toast.success("Copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };
  const [size, setSize] = useState({ width: 600, height: 350 });

  const fgRef = useRef<ForceGraphMethods<Node, Link>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleResize = () => {
    const fg = fgRef.current;
    if (fg && containerRef.current) {
      setSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const fg = fgRef.current;

    if (fg && graphData && graphData.nodes.length > 0) {
      (
        fg.d3Force("charge") as ForceManyBody<Node & SimulationNodeDatum>
      )?.strength((n) => n.value * -50);
    }
  }, [graphData]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  useEffect(() => {
    handleResize();
  }, [isFullscreen]);
  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Escape" && isFullscreen) {
          setIsFullscreen(false);
        }
      }}
      ref={containerRef}
      className="relative"
      style={
        isFullscreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "white",
              zIndex: 1000,
            }
          : { width: "100%", height: "100%" }
      }
    >
      <Button
        onClick={toggleFullscreen}
        variant={"ghost"}
        className="absolute top-0 right-0 z-10"
      >
        {isFullscreen ? <ShrinkIcon size={24} /> : <ExpandIcon size={24} />}
      </Button>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={size.width}
        height={size.height}
        nodeVal={(node) => {
          return node.value;
        }}
        nodeLabel={(node) => renderToString(<NodeLabelComponent node={node} />)}
        nodeAutoColorBy="id"
        backgroundColor="rgba(0,0,0,0)"
        linkWidth={0.5}
        linkCurvature={0.25}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        linkColor={(link) => {
          if (
            hoveredNode &&
            (link.source.id === hoveredNode.id ||
              link.target.id === hoveredNode.id)
          ) {
            return "black"; // Replace with your desired highlight color
          }
          return "lightgrey";
        }}
      />
      <div className="absolute bottom-0 right-0 z-10 text-sm text-gray-600 bg-muted px-2 py-1 rounded-t-sm">
        Addresses: <span>{graphData.nodes.length}</span> | Transactions:{" "}
        <span>{graphData.links.length}</span>
      </div>
    </div>
  );
}
