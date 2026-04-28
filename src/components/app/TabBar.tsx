import { ReactNode } from "react";
import { Home, ClipboardList, Sparkles, User } from "lucide-react";

interface TabBarProps {
  active: string;
  accent: "doctor" | "therapist" | "nurse";
  onChange?: (key: string) => void;
}

export const TabBar = ({ active, accent, onChange }: TabBarProps) => {
  const items = [
    { key: "home", label: "工作台", icon: Home },
    { key: "tasks", label: "任务", icon: ClipboardList },
    { key: "ai", label: "AI助手", icon: Sparkles },
    { key: "me", label: "我的", icon: User },
  ];
  const accentClass = {
    doctor: "text-role-doctor",
    therapist: "text-role-therapist",
    nurse: "text-role-nurse",
  }[accent];

  return (
    <div className="shrink-0 bg-card/95 backdrop-blur-xl border-t border-border/60 px-2 pt-2 pb-5 z-20">
      <div className="flex items-center justify-around">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onChange?.(it.key)}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-all"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-all ${
                  isActive ? accentClass : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? accentClass : "text-muted-foreground"
                }`}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ScreenShell: phone screen layout — scrollable body + tab bar pinned to phone bottom.
 * Relies on parent (PhoneFrame content area) providing a fixed height.
 */
export const ScreenShell = ({
  children,
  tabBar,
}: {
  children: ReactNode;
  tabBar?: ReactNode;
}) => (
  <div className="relative h-full flex flex-col">
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">{children}</div>
    {tabBar}
  </div>
);
