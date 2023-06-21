import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
interface StatisticsCardProps {
  title: string;
  value: string;
  delta: number;
  isIncrease: boolean;
}

const StatisticsCard = ({
  title,
  value,
  delta,
  isIncrease,
}: StatisticsCardProps) => {
  return (
    <Card sx={{ width: "100%", px: 2, py: 1 }}>
      <Typography variant="body1" component="div" color={"lightgray"}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h4" component="div">
          {value}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {isIncrease ? (
            <ArrowDropUpIcon color="success" />
          ) : (
            <ArrowDropDownIcon color="error" />
          )}
          <Typography variant="subtitle1" component="div">
            <strong style={{ color: isIncrease ? "green" : "red" }}>
              {Math.abs(delta)}
            </strong>{" "}
            since last month
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default StatisticsCard;
