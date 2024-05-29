import { Open_Sans, Poppins } from "next/font/google";

export const fontPoppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-family-poppins",
});
export const fontSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-family-sans",
});
