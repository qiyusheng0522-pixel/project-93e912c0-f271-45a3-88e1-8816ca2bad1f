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
    <div className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/60 px-2 pt-2 pb-6 z-20">
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

export const ScreenShell = ({
  children,
  tabBar,
}: {
  children: ReactNode;
  tabBar?: ReactNode;
}) => (
  <div className="relative min-h-full flex flex-col">
    <div className="flex-1">{children}</div>
    {tabBar}
  </div>
);
