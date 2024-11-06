import { 
  Home, 
  LayoutDashboard, 
  Ticket, 
  Droplet, 
  FileText, 
  BookOpen,
  PlusCircle,
  List,
  BarChart3
} from "lucide-react"

export type NavItem = MainNavItem | SubNavigationGroup;
export type MainNavItem = {
  icon?: React.ReactNode;
  title: string;
  href: string;
};

export type SubNavigationGroup = {
  icon?: React.ReactNode;
  title: string;
  items: SubNavItem[];
};
export type SubNavItem = {
  icon?: React.ReactNode;
  title: string;
  href: string;
  description?: string;
  rowSpan?: number;
};

const siteConfig: {
  name: string;
  mainNav: NavItem[];
} = {
  name: "Sarafu Network",
  mainNav: [
    {
      icon: <Home size={18} />,
      title: "Home",
      href: "/",
    },
    {
      icon: <LayoutDashboard size={18} />,
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Vouchers",
      icon: <Ticket size={18} />,
      items: [
        {
          icon: <PlusCircle size={16} />,
          title: "Create Voucher",
          href: "/publish",
          description: "Create your own community vouchers",
        },
        {
          icon: <List size={16} />,
          title: "Explore Vouchers",
          href: "/vouchers",
          description: "Browse community vouchers",
        },
        {
          icon: <BarChart3 size={16} />,
          title: "Network Visualization",
          href: "https://viz.sarafu.network/",
          description: "View the Sarafu Network in 3D",
        },
      ],
    },
    {
      title: "Pools",
      icon: <Droplet size={18} />,
      items: [
        {
          icon: <PlusCircle size={16} />,
          title: "Create Pool",
          href: "/pools/create",
          description: "Create your own swap pool",
        },
        {
          icon: <List size={16} />,
          title: "Explore Pools",
          href: "/pools",
          description: "Browse existing swap pools",
        },
      ],
    },
    {
      icon: <FileText size={18} />,
      title: "Blog",
      href: "https://grassecon.org/category/blog",
    },
    {
      icon: <BookOpen size={18} />,
      title: "Documentation",
      items: [
        {
          icon: <FileText size={16} />,
          title: "Grassroots Economics",
          href: "https://docs.grassecon.org/",
          description: "Learn about Grassroots Economics",
        },
        {
          icon: <FileText size={16} />,
          title: "Software Stack",
          href: "https://cic-stack.grassecon.org/",
          description: "Explore the Sarafu Network software",
        },
      ],
    },
  ],
};

export { siteConfig };
