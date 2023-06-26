import { useTheme } from "@mui/material";
import { ColorType, createChart, type UTCTimestamp } from "lightweight-charts";
import { useEffect, useRef } from "react";

export const LineChart = (props: {
  data: {
    time: UTCTimestamp;
    value: number;
  }[];
  colors?:
    | {
        backgroundColor?: "white" | undefined;
        lineColor?: "#2962FF" | undefined;
        textColor?: "black" | undefined;
        areaTopColor?: "#2962FF" | undefined;
        areaBottomColor?: "rgba(41, 98, 255, 0.28)" | undefined;
      }
    | undefined;
}) => {
  const theme = useTheme();
  const {
    data,
    colors: {
      backgroundColor = theme.palette.background.paper,
      lineColor = theme.palette.primary.main,
      textColor = "black",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = {},
  } = props;
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    const chart = createChart(chartContainerRef.current!, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current!.clientWidth,
      height: 330,
    });
    chart.timeScale().fitContent();

    const newSeries = chart.addLineSeries({
      color: lineColor,
    });
    newSeries.setData(data);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ]);

  return <div ref={chartContainerRef} />;
};
