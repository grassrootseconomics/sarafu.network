import { type Metadata } from "next";
import { ExplorePage } from "./explore";

export const metadata: Metadata = {
  title: "Explore",
};

export default function Page() {
  return <ExplorePage />;
}
