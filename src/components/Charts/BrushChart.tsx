import { Brush } from "@visx/brush";
import type BaseBrush from "@visx/brush/lib/BaseBrush";
import { type BrushHandleRenderProps } from "@visx/brush/lib/BrushHandle";
import { type Bounds } from "@visx/brush/lib/types";
import { Group } from "@visx/group";
import { PatternLines } from "@visx/pattern";
import { scaleLinear, scaleTime } from "@visx/scale";
import { extent, max } from "d3-array";
import { useMemo, useRef, useState } from "react";
import AreaChart from "./AreaChart";

// Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
const GRADIENT_ID = "brush_gradient";

// accessors

export type BrushProps<T> = {
  width: number;
  height: number;
  data: { x: Date; y: bigint }[];
  getY: (p: { x: Date; y: bigint }) => number;
  getX: (p: { x: Date; y: bigint }) => Date;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
};

function BrushChart<T extends object[]>({
  compact = false,
  width,
  height,
  data,
  getX,
  getY,
  margin = {
    top: 20,
    left: 50,
    bottom: 20,
    right: 20,
  },
}: BrushProps<T>) {
  const brushRef = useRef<BaseBrush | null>(null);
  const [filteredData, setFilteredData] = useState(data);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const dataCopy = data.filter((p) => {
      const x = getX(p).getTime();
      const y = getY(p);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredData(dataCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0
  );

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredData, getX) as [Date, Date],
      }),
    [xMax, filteredData]
  );
  const stockScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredData, getY) || 0],
        nice: true,
      }),
    [yMax, filteredData]
  );
  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(data, getX) as [Date, Date],
      }),
    [xBrushMax]
  );
  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(data, getY) || 0],
        nice: true,
      }),
    [yBrushMax]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: brushDateScale(getX(data[0])) },
      end: { x: brushDateScale(getX(data[data.length - 1])) },
    }),
    [brushDateScale]
  );

  // event handlers
  // const handleClearClick = () => {
  //   if (brushRef?.current) {
  //     setFilteredData(data);
  //     brushRef.current.reset();
  //   }
  // };

  // const handleResetClick = () => {
  //   if (brushRef?.current) {
  //     const updater: UpdateBrush = (prevBrush) => {
  //       const newExtent = brushRef.current!.getExtent(
  //         initialBrushPosition.start,
  //         initialBrushPosition.end
  //       );

  //       const newState: BaseBrushState = {
  //         ...prevBrush,
  //         start: { y: newExtent.y0, x: newExtent.x0 },
  //         end: { y: newExtent.y1, x: newExtent.x1 },
  //         extent: newExtent,
  //       };

  //       return newState;
  //     };
  //     brushRef.current.updateBrush(updater);
  //   }
  // };

  return (
    <div>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={`url(#${GRADIENT_ID})`}
          rx={14}
        />
        <AreaChart
          hideBottomAxis={compact}
          data={filteredData}
          width={width}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          yMax={yMax}
          getX={getX}
          getY={getY}
          xScale={dateScale}
          yScale={stockScale}
          // gradientColor={token.colorPrimaryBgHover}
        />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={data}
          width={width}
          getX={getX}
          getY={getY}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          // gradientColor={token.colorPrimaryBgHover}
        >
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            // stroke={}
            strokeWidth={1}
            orientation={["diagonal"]}
          />
          <Brush
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={["left", "right"]}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={() => setFilteredData(data)}
            selectedBoxStyle={{
              fill: `url(#${PATTERN_ID})`,
              // stroke: token.colorPrimaryActive,
            }}
            useWindowMoveEvents
            renderBrushHandle={(props) => <BrushHandle {...props} />}
          />
        </AreaChart>
      </svg>
      {/* <Button onClick={handleClearClick}>Clear</Button>&nbsp;
      <Button onClick={handleResetClick}>Reset</Button> */}
    </div>
  );
}
// We need to manually offset the handles for them to be rendered at the right position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill="#f2f2f2"
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: "ew-resize" }}
      />
    </Group>
  );
}

export default BrushChart;
