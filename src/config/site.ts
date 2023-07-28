export const siteConfig = {
  name: "Sarafu Network",
  mainNav: [
    { title: "Dashboard", href: "/dashboard", key: "dashboard" },

    { title: "Vouchers", href: "/vouchers", key: "vouchers" },
    {
      title: "Visualization",
      href: "https://viz.sarafu.network/",
      key: "viz",
    },
    {
      title: "Documentation",
      href: "https://docs.grassecon.org/",
      key: "docs  ",
    },
  ],
} as const;
