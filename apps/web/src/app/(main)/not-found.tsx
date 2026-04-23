const NotFoundPage = () => {
  return (
    <div className="flex relative flex-col items-center justify-center min-h-[70dvh] ">
      <div className="flex flex-col items-center justify-center min-h-[70dvh] ">
        <h1 className="text-6xl font-bold text-gray-800 mb-4"> 🔥 404 🔥</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-8">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-500 mb-8">
          Sorry, the page you are looking for does not exist
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
