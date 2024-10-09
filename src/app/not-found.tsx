import Link from "next/link";
import { Background } from "~/components/layout/background";
import { Button } from "~/components/ui/button";

const NotFoundPage = () => {
  return (
    <>
      <Background animate />
      <div className="flex flex-col items-center justify-center min-h-dvh ">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-8">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-500 mb-8">
          Sorry, the page you are looking for does not exist
        </p>
        <Button variant="default" size="lg">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </>
  );
};

export default NotFoundPage;
