import { format } from "date-fns";
import { CalendarIcon, MapPin, PencilIcon, UserCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isAddress } from "viem";
import PlateEditor from "~/components/editor/report-editor";
import { ContentContainer } from "~/components/layout/content-container";
import { Loading } from "~/components/loading";
import LocationMap from "~/components/map/location-map";
import { ReportStatusMenu } from "~/components/reports/report-status-menu";
import { RejectionNotice } from "~/components/reports/rejection-notice";
import { ReportLocationName } from "~/components/reports/report-location-name";
import { ReportTag } from "~/components/reports/report-tag";
import { buttonVariants } from "~/components/ui/button";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { Authorization } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { auth } from "~/server/api/auth";
import { caller } from "~/server/api/routers/_app";
import { ReportStatusEnum } from "~/server/enums";

type Props = {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Enable ISR with a revalidation period of 30 days
export const revalidate = 2592000;

// Instead of using generateStaticParams, we'll let Next.js handle dynamic routes
// and rely on ISR for caching

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const reportId = parseInt(params.reportId);
  const report = await caller.report.findById({ id: reportId });

  if (!report) {
    return {
      title: "Report Not Found",
      description: "The requested report could not be found.",
    };
  }

  return {
    title: report.title,
    description: report.description ?? "",
    openGraph: {
      title: report.title,
      description: report.description ?? "",
      url: `https://sarafu.network/reports/${reportId}`,
      images: report.image_url ? [report.image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `Report: ${report.title}`,
      description: report.description ?? "",
      images: report.image_url ? [report.image_url] : [],
    },
  };
}

export default async function ReportPage(props: Props) {
  const params = await props.params;
  const reportId = parseInt(params.reportId);
  const report = await caller.report.findById({ id: reportId });
  const session = await auth();
  if (!report) {
    notFound();
  }

  return (
    <ContentContainer>
      <article className="max-w-3xl mx-auto prose prose-lg dark:prose-invert px-4 sm:px-6 pt-2">
        <div className="relative flex items-center justify-center mb-6">
          <Authorization
            resource="Reports"
            action="UPDATE"
            isOwner={report.created_by === session?.user?.id}
          >
            <ReportStatusMenu
              report={report}
              isOwner={report.created_by === session?.user?.id}
            />
            <div
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                }),
                "absolute right-0 flex items-center"
              )}
            >
              <Link
                href={`/reports/${report.id}/edit`}
                className="flex justify-center items-center gap-2"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Report
              </Link>
            </div>
          </Authorization>
        </div>

        {/* Rejection Notice */}
        {report.status === ReportStatusEnum.REJECTED &&
          report.rejection_reason && (
            <div className="mb-8 not-prose">
              <RejectionNotice
                reason={report.rejection_reason}
                variant="compact"
              />
            </div>
          )}

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 break-words">
              {report.title}
            </h1>

            {/* Author and Date */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-500 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{report.creator_name ?? "Anonymous"}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <time dateTime={report.created_at.toISOString()}>
                  {format(new Date(report.created_at), "MMMM d, yyyy")}
                </time>
              </div>
              <span className="hidden sm:inline">•</span>
              <a
                href="#location-map"
                className="flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <ReportLocationName location={report.location} />
              </a>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 px-2">
              <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto">
                {report.tags?.map((tag) => (
                  <ReportTag key={tag} tag={tag} />
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Report Period if exists */}
        {report.period && (
          <div className="mt-8 mb-4 p-4 bg-gray-50 rounded-lg overflow-x-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-gray-600 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">Report Period:</span>
              </div>
              <span className="whitespace-nowrap">
                {format(new Date(report.period.from), "MMMM d, yyyy")} -{" "}
                {format(new Date(report.period.to), "MMMM d, yyyy")}
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mt-8 overflow-x-auto">
          <PlateEditor disabled={true} initialValue={report.report} />
        </div>

        {/* Related Vouchers */}
        {report.vouchers?.length > 0 && (
          <footer className="mt-12 py-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Related Vouchers</h3>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {report.vouchers.map(
                (voucher) =>
                  isAddress(voucher) && (
                    <VoucherChip
                      key={voucher}
                      clickable={true}
                      voucher_address={voucher}
                      className="hover:shadow-md transition-shadow shrink-0"
                    />
                  )
              )}
            </div>
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div
              id="location-map"
              className="flex flex-wrap gap-2 overflow-x-auto pb-2"
            >
              {report?.location ? (
                <Suspense fallback={<Loading />}>
                  <LocationMap
                    style={{
                      height: "350px",
                      width: "100%",
                      zIndex: 1,
                    }}
                    value={
                      report?.location
                        ? {
                            latitude: report?.location?.x,
                            longitude: report?.location?.y,
                          }
                        : undefined
                    }
                  />
                </Suspense>
              ) : (
                <p className="text-gray-600">No location data provided.</p>
              )}
            </div>
          </footer>
        )}
      </article>
    </ContentContainer>
  );
}
