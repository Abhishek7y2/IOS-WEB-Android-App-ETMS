// src/components/Avatar.tsx
// Shows a colored circle with the person's initials.
// Initials and color are auto-generated from the name — no hardcoding needed.

interface AvatarProps {
  name: string;
}

// Generates a consistent color from the name string
const avatarColors = [
  "bg-indigo-50 text-indigo-600 border border-indigo-100/70",
  "bg-pink-50 text-pink-600 border border-pink-100/70",
  "bg-emerald-50 text-emerald-600 border border-emerald-100/70",
  "bg-sky-50 text-sky-600 border border-sky-100/70",
  "bg-violet-50 text-violet-600 border border-violet-100/70",
  "bg-amber-50 text-amber-600 border border-amber-100/70",
  "bg-rose-50 text-rose-600 border border-rose-100/70",
  "bg-teal-50 text-teal-600 border border-teal-100/70",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatarColors.length;
}

export default function Avatar({ name }: AvatarProps) {
  const initials = getInitials(name);
  const color = avatarColors[getColorIndex(name)];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${color}`}>
        {initials}
      </div>
      <span className="text-xs font-semibold text-gray-700">{name}</span>
    </div>
  );
}
