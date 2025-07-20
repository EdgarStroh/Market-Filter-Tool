import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  variant?: "search" | "dashboard" | "chart" | "table" | "company-card";
  count?: number;
}

export const LoadingSkeleton = ({ variant = "company-card", count = 1 }: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case "search":
        return (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        );

      case "dashboard":
        return (
          <Card className="w-full">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        );

      case "chart":
        return (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        );

      case "table":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-full" />
                ))}
              </div>
            ))}
          </div>
        );

      case "company-card":
      default:
        return (
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};