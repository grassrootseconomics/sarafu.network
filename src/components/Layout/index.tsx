import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import * as React from "react";
import { SarafuIcon } from "../Icons/SarafuIcon";
import { SarafuNetworkIcon } from "../Icons/SarafuNetwork";
import { NextLinkComposed } from "../Link";

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children?: React.ReactNode;
}

const drawerWidth = 240;
const navItems = [
  { title: "Deploy", path: "/deploy", key: "deploy" },
  { title: "Vouchers", path: "/vouchers", key: "vouchers" },
  { title: "Network", path: "https://viz.sarafu.network/", key: "network" },
];
export function Layout(props: Props) {
  const { window } = props;
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <SarafuIcon sx={{ height: 35, m: 2 }} />
      <SarafuNetworkIcon
        sx={{
          height: 15,
          m: "auto",
          mb: 2,
        }}
      />

      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              LinkComponent={NextLinkComposed}
              href={item.path}
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        component="nav"
        color="transparent"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.61)",
          backdropFilter: "blur(5px)",
        }}
        elevation={0}
      >
        <Toolbar>
          {navItems.length > 0 && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => router.push("/")}
            sx={{ display: "flex", flexDirection: "row", cursor: "pointer" }}
          >
            <SarafuIcon sx={{ height: 30, m: "auto", mr: 2 }} />
            <SarafuNetworkIcon
              sx={{
                height: 20,
                m: "auto",
                display: { xs: "none", sm: "none", md: "block" },
              }}
            />
          </Box>

          <Box sx={{ display: { xs: "none", sm: "block" }, mr: 2, ml: "auto" }}>
            {navItems.map((item) => (
              <Button
                LinkComponent={NextLinkComposed}
                href={item.path}
                key={item.key}
              >
                {item.title}
              </Button>
            ))}
          </Box>
          <Box sx={{ ml: 2 }}>
            <ConnectButton />
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box sx={{ pt: "64px", width: "100%", minHeight: "calc(100vh)" }}>
        {props.children}
      </Box>
    </Box>
  );
}
