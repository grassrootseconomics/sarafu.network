import { Navbar } from "~/components/layout/navbar";
import { useScreenType } from "~/hooks/useMediaQuery";
import { truncateString } from "~/utils/string";

interface ContentContainerProps {
  title: string;
  Icon?: React.ElementType;
  children: React.ReactNode;
}

export function ContentContainer({
  title,
  children,
  Icon,
}: ContentContainerProps) {
  const screen = useScreenType();
  const titleR = truncateString(
    title,
    screen.isMobile ? 5 : screen.isTablet ? 10 : title.length
  );
  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-[100vw] min-h-[100vh] h-[100%] overflow-hidden -z-10 [&>*]:rounded-full [&>*]:absolute [&>*]:z-[-1]">
        <div className="bg-[#eef8f3] size-[40vw] top-[-400px] left-[-350px] "></div>
        <div className="bg-[#f8f6ee] size-[200px] top-[50%]    left-[10%] "></div>
        <div className="bg-[#f8eef1] size-[80px]  top-[40%]    left-[50%] "></div>
        <div className="bg-[#eef3f8] size-[800px] top-[70%]    left-[70%] "></div>
      </div>
      <Navbar title={titleR} Icon={Icon} />
      <div className="container py-8 px-1 md:px-8">{children}</div>
    </div>
  );
}
