import { ParentSize } from "@visx/responsive";
import dynamic from "next/dynamic";
import { Loading } from "../Loading";
const BrushChart = dynamic(() => import("./BrushChart"), { ssr: false });

export function DynamicChart({
  data,
  loading,
}: {
  data?: { x: Date; y: string }[];
  loading: boolean;
}) {
  if (!data && !loading) return <div>Failed to load data</div>;
  return (
    <ParentSize>
      {({ width, height }) => {
        if (!data) return <Loading />;
        return (
          <BrushChart
            getX={(d) => d.x}
            getY={(d) => Number(d.y)}
            data={data || []}
            width={width}
            height={height}
          />
        );
      }}
    </ParentSize>
  );
}
