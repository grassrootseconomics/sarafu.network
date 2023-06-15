import { type SxProps, type Theme } from "@mui/material";
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="tabs">
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} {...a11yProps(index)} />
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
