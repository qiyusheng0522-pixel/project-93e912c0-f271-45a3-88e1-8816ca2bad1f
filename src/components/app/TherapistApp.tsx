import { useState } from "react";
import { ScreenShell, TabBar } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Brain,
  MessageSquare,
  Pill,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

export const TherapistApp = () => {
  const [tab, setTab] = useState("home");
  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="therapist" />}>
      {tab === "home" && <Home />}
      {tab === "tasks" && <TaskList />}
      {tab === "ai" && <AIPanel />}
      {tab === "me" && <Me />}
    </ScreenShell>
  );
};

const Home = () => (
  <div className="pb-4">
    <div className="gradient-therapist px-5 pt-2 pb-8 text-white relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-xs opacity-80">下午好，王治疗师</div>
          <div className="text-lg font-semibold mt-0.5">PT 物理治疗 · 三楼训练室</div>
        </div>
        <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
        </button>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <div className="bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">今日治疗</div>
          <div className="text-2xl font-bold mt-0.5">12</div>
        </div>
        <div className="bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">已完成</div>
          <div className="text-2xl font-bold mt-0.5">7</div>
        </div>
        <div className="bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">待打卡</div>
          <div className="text-2xl font-bold mt-0.5">5</div>
        </div>
      </div>
    </div>

    <div className="px-4 -mt-4 space-y-4">
      <AICard
        title="AI 推送的治疗任务"
        action={
          <button className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1">
            查看全部 5 项 <ArrowRight className="w-4 h-4" />
          </button>
        }
      >
        基于今日排班，AI 已为你智能编排 5 个治疗时段，平均利用率 92%。
      </AICard>

      <div>
        <SectionTitle title="治疗师工作台" />
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ClipboardList, label: "评估确认", color: "text-secondary bg-secondary-soft" },
            { icon: Activity, label: "治疗目标", color: "text-primary bg-primary-soft" },
            { icon: Calendar, label: "智能排班", color: "text-ai bg-ai-soft" },
            { icon: Dumbbell, label: "康复处方", color: "text-success bg-success-soft" },
            { icon: Brain, label: "OT/ST", color: "text-warning bg-warning-soft" },
            { icon: CheckCircle2, label: "打卡记录", color: "text-secondary bg-secondary-soft" },
            { icon: MessageSquare, label: "工作小结", color: "text-primary bg-primary-soft" },
            { icon: Pill, label: "药物变动", color: "text-ai bg-ai-soft" },
          ].map((it) => (
            <button key={it.label} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card">
              <div className={`w-9 h-9 rounded-xl ${it.color} flex items-center justify-center`}>
                <it.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] text-foreground font-medium">{it.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="今日排班" extra={<span className="text-[11px] text-muted-foreground">AI 自动生成 · 可手动调整</span>} />
        <div className="space-y-2">
          <ScheduleCard time="09:00" patient="张建国" type="PT · 步态训练" status="done" room="A-301" />
          <ScheduleCard time="10:30" patient="王秀英" type="PT · 关节松动" status="done" room="A-303" />
          <ScheduleCard time="14:00" patient="李 强" type="OT · ADL 训练" status="active" room="B-201" />
          <ScheduleCard time="15:30" patient="陈丽华" type="ST · 吞咽训练" status="upcoming" room="B-205" />
          <ScheduleCard time="16:30" patient="刘伟明" type="PT · 平衡训练" status="upcoming" room="A-301" />
        </div>
      </div>
    </div>
  </div>
);

const ScheduleCard = ({
  time,
  patient,
  type,
  status,
  room,
}: {
  time: string;
  patient: string;
  type: string;
  status: "done" | "active" | "upcoming";
  room: string;
}) => {
  const sm = {
    done: { color: "bg-success-soft text-success", label: "已完成", border: "border-l-success" },
    active: { color: "bg-secondary-soft text-secondary", label: "进行中", border: "border-l-secondary" },
    upcoming: { color: "bg-muted text-muted-foreground", label: "待开始", border: "border-l-border" },
  }[status];
  return (
    <div className={`bg-card rounded-2xl shadow-card p-3.5 border-l-4 ${sm.border} flex items-center gap-3`}>
      <div className="text-center">
        <div className="text-sm font-bold text-foreground">{time}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{room}</div>
      </div>
      <div className="flex-1 border-l border-border/60 pl-3">
        <div className="text-[13px] font-semibold">{patient}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{type}</div>
      </div>
      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${sm.color}`}>
        {sm.label}
      </span>
    </div>
  );
};

const TaskList = () => (
  <div className="px-4 pt-4 pb-4">
    <h2 className="text-xl font-bold mb-1">康复处方执行</h2>
    <p className="text-xs text-muted-foreground mb-4">李 强 · OT 训练 · 14:00</p>

    <div className="bg-card rounded-2xl shadow-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">今日处方进度</div>
        <span className="text-secondary text-sm font-bold">3/5</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full gradient-therapist" style={{ width: "60%" }} />
      </div>
    </div>

    <SectionTitle title="处方项目" />
    <div className="space-y-2 mb-4">
      <ExerciseItem name="坐位躯干稳定" set="3 组 × 10 次" done />
      <ExerciseItem name="精细抓握训练" set="2 组 × 15 次" done />
      <ExerciseItem name="日常穿衣模拟" set="20 分钟" done />
      <ExerciseItem name="厨房活动训练" set="25 分钟" active />
      <ExerciseItem name="书写训练" set="15 分钟" />
    </div>

    <button className="w-full gradient-therapist text-white rounded-2xl py-3.5 text-sm font-semibold shadow-card flex items-center justify-center gap-2">
      <CheckCircle2 className="w-4 h-4" /> 完成打卡 + 记录小结
    </button>
  </div>
);

const ExerciseItem = ({
  name,
  set,
  done,
  active,
}: {
  name: string;
  set: string;
  done?: boolean;
  active?: boolean;
}) => (
  <div className="bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3">
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
        done
          ? "bg-success text-success-foreground"
          : active
          ? "gradient-therapist text-white"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {done ? <CheckCircle2 className="w-5 h-5" /> : active ? <PlayCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
    </div>
    <div className="flex-1">
      <div className="text-[13px] font-semibold">{name}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{set}</div>
    </div>
    {active && (
      <button className="text-[11px] px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-semibold">
        打卡
      </button>
    )}
  </div>
);

const AIPanel = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <AICard
      title="AI 调整后的治疗目标"
      action={
        <div className="flex gap-2">
          <button className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold">
            自定义调整
          </button>
          <button className="flex-1 bg-ai text-ai-foreground rounded-xl py-2 text-xs font-semibold">
            确认应用
          </button>
        </div>
      }
    >
      AI 将李强本周 ADL 目标提升至 70 分（+5），并新增 OT 厨房训练任务。
    </AICard>

    <AICard
      title="AI 排班建议"
      action={
        <button className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold">
          手动微调排班
        </button>
      }
    >
      明日治疗时段共 8 个，AI 已根据资源平台空闲时间智能编排，节省调度时间约 35 分钟。
    </AICard>

    <AICard title="AI 处方建议">
      检测到患者王秀英髋关节活动度提升明显，建议在原 PT 处方中加入站立位平衡训练。
    </AICard>
  </div>
);

const Me = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-therapist flex items-center justify-center text-white text-xl font-bold">
        王
      </div>
      <div>
        <div className="text-base font-bold">王雅琴 治疗师</div>
        <div className="text-xs text-muted-foreground mt-0.5">PT/OT 双证 · 8 年</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <StatChip label="本月治疗" value="248" accent="primary" />
      <StatChip label="患者好评" value="98%" accent="success" />
    </div>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["我的患者", "治疗记录", "排班管理", "知识库", "设置"].map((it) => (
        <div key={it} className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  </div>
);
