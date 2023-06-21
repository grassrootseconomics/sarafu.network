/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ParentSize } from "@visx/responsive";
import dynamic from "next/dynamic";
import { Loading } from "../Loading";
const BrushChart = dynamic(() => import("./BrushChart"), { ssr: false });

export function DynamicChart<T>({
  data,
  loading,
  getX,
  getY,
}: {
  data?: T[];
  loading: boolean;
  getX: (d: T) => Date;
  getY: (d: T) => number;
}) {
  if (!data && !loading) return <div>Failed to load data</div>;
  return (
    <ParentSize>
      {({ width, height }) => {
        if (!data) return <Loading />;
        return (
          <BrushChart
            // @ts-ignore
            getX={getX}
            // @ts-ignore
            getY={getY}
            data={data || []}
            width={width}
            height={height}
          />
        );
      }}
    </ParentSize>
  );
}
