'use client';

import { Skeleton } from '@heroui/react';

export default function AuctionCardSkeleton() {
    return (
        <div className="shadow-sm rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Thumbnail Skeleton */}
            <div className="relative w-full h-48">
                <Skeleton className="absolute inset-0 w-full h-full" />

                {/* D-Day Chip Position */}
                <div className="absolute top-2 right-2">
                    <Skeleton className="w-12 h-5 rounded-full" />
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-4 w-2/3 rounded" />

                {/* Minimum Price */}
                <div>
                    <Skeleton className="h-5 w-1/2 rounded" />
                </div>

                {/* Estimated Price */}
                <Skeleton className="h-3 w-1/3 rounded" />

                {/* Address */}
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />

                {/* Area */}
                <Skeleton className="h-3 w-3/4 rounded" />

                {/* Auction Date */}
                <Skeleton className="h-3 w-1/2 rounded" />

                {/* Status chips */}
                <div className="flex gap-2 pt-1">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
            </div>
        </div>
    );
}
