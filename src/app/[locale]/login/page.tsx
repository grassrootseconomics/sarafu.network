import { type Metadata } from "next";
import {Login} from "./login";

export const metadata: Metadata = {
  title: "Login to Sarafu Network",
  description: "Login to Sarafu Network.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
const GeneratePage = () => {
  return (
    <div>
      <Login />
    </div>
  );
};

export default GeneratePage;
