import { styled, type SxProps, type Theme } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import * as React from "react";
interface TabData {
  label: string;
  content: string | JSX.Element;
}

interface TabsComponentProps {
  tabs: TabData[];
  panelSxProps?: SxProps<Theme>;
}
interface StyledTabProps {
  label: string;
}

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: "none",
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  borderRadius: "10px",
  margin: "8px",
  paddingTop: 0,
  paddingBottom: 0,
  minHeight: "30px",
  "&.Mui-button": {},
  // color: "rgba(255, 255, 255, 0.7)",
  "&.Mui-selected": {
    // color: "#fff",
    boxShadow:
      "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
}));
function TabPanel<T>(props: {
  children?: React.ReactNode;
  index: number;
  value: T;
  sx?: SxProps<Theme>;
  panelSxProps?: SxProps<Theme>;
}) {
  const { children, value, sx, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      sx={sx}
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const TabsComponent: React.FC<TabsComponentProps> = ({
  tabs,
  panelSxProps,
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mx: 2 }}>
        <Tabs
          sx={{
            backgroundColor: "none",
            ".MuiTabs-indicator": {
              display: "none",
            },
          }}
          value={value}
          onChange={handleChange}
          aria-label="tabs"
        >
          {tabs.map((tab, index) => (
            <StyledTab key={index} label={tab.label} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {tabs.map((tab, index) => (
        <TabPanel sx={panelSxProps} key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};

export default TabsComponent;
