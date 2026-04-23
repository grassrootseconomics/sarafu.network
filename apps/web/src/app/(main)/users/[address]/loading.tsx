import { ContentContainer } from "~/components/layout/content-container";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function UserProfileLoading() {
  return (
    <ContentContainer>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Profile Header Skeleton */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              {/* Avatar Skeleton */}
              <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />

              {/* User Info Skeleton */}
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" /> {/* Name */}
                <Skeleton className="h-4 w-32" /> {/* Location */}
                <Skeleton className="h-4 w-96 max-w-full" /> {/* Address */}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs Skeleton */}
        <Card>
          <CardHeader>
            {/* Tab List Skeleton */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tab Content Skeleton - List of items */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ContentContainer>
  );
}
