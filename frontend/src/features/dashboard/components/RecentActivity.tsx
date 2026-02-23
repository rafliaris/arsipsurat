import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecentActivity as RecentActivityType } from "@/features/dashboard/types"
import { formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface RecentActivityProps {
    loading?: boolean;
    activities?: RecentActivityType[];
}

// Helper to extract display name from title or description
function extractDisplayName(activity: RecentActivityType): string {
    // Try to extract from title pattern like "User Name menambahkan..."
    const match = activity.title.match(/^([^:]+):/);
    if (match) {
        return match[1];
    }
    // Fallback to type-based display
    return activity.description || activity.type;
}

// Helper to generate initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
    try {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: localeId
        });
    } catch {
        return dateString;
    }
}

export function RecentActivity({ loading, activities }: RecentActivityProps) {
    if (loading) {
        return (
            <div className="space-y-8">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div className="flex items-center" key={i}>
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="ml-4 space-y-1 flex-1">
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-3 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
                Belum ada aktivitas
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {activities.map((activity) => {
                const displayName = extractDisplayName(activity);
                const initials = getInitials(displayName);

                return (
                    <div className="flex items-center" key={activity.id}>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="/avatars/default.png" alt="Avatar" />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {activity.description}
                            </p>
                        </div>
                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                            {formatRelativeTime(activity.created_at)}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}
