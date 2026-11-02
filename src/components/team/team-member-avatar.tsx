import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type TeamMemberAvatarProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function TeamMemberAvatar({
  name,
  imageUrl,
  className,
}: TeamMemberAvatarProps) {
  return (
    <Avatar className={cn("size-9", className)}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-statute/10 text-xs font-medium text-statute">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
