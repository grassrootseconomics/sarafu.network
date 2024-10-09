import { type Metadata } from "next";
import { Generate } from "./generate";

export const metadata: Metadata = {
  title: "Generate Accounts",
  description: "Create accounts for Sarafu Network.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
const GeneratePage = () => {
  return <Generate />;
};

export default GeneratePage;
