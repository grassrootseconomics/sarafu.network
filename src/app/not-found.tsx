import { useTranslations } from "next-intl";

const NotFoundPage = () => {
  const t = useTranslations("errors.404");
  
  return (
    <div className="flex relative flex-col items-center justify-center min-h-[70dvh] ">
      <div className="flex flex-col items-center justify-center min-h-[70dvh] ">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">{t("title")}</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-8">
          {t("heading")}
        </h2>
        <p className="text-lg text-gray-500 mb-8">
          {t("message")}
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
