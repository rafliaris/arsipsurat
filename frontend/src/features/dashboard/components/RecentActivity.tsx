import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockActivities } from "@/services/mockDashboardService"

export function RecentActivity() {
    return (
        <div className="space-y-8">
            {mockActivities.map((activity) => (
                <div className="flex items-center" key={activity.id}>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={activity.avatar} alt="Avatar" />
                        <AvatarFallback>{activity.initials}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">
                            {activity.action}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">{activity.time}</div>
                </div>
            ))}
        </div>
    )
}
