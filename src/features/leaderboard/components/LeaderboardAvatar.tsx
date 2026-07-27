import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(fullName: string | null, username: string): string {
  if (fullName) {
    return fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export function LeaderboardAvatar({
  fullName,
  username,
  avatarUrl,
  size = "default",
  className,
}: {
  fullName: string | null;
  username: string;
  avatarUrl: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={cn("shrink-0", className)}>
      <AvatarImage src={avatarUrl ?? undefined} alt={fullName ?? username} referrerPolicy="no-referrer" />
      <AvatarFallback className="bg-accent-muted text-xs font-semibold text-accent">
        {getInitials(fullName, username)}
      </AvatarFallback>
    </Avatar>
  );
}
