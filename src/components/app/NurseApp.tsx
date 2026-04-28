import { useState } from "react";
import { ScreenShell, TabBar } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import {
  Bell,
  ChevronRight,
  Pill,
  HeartPulse,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Syringe,
  Activity,
  ClipboardCheck,
  Users,
  Stethoscope,
} from "lucide-react";

export const NurseApp = () => {
  const [tab, setTab] = useState("home");
  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="nurse" />}>
      {tab === "home" && <Home />}
      {tab === "tasks" && <Tasks />}
      {tab === "ai" && <Edu />}
      {tab === "me" && <Me />}
    </ScreenShell>
  );
};

const Home = () => (
  <div className="pb-4">
    <div className="gradient-nurse px-5 pt-2 pb-8 text-white relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-xs opacity-80">您好，赵护士</div>
          <div className="text-lg font-semibold mt-0.5">康复护理 · 西区病房</div>
        </div>
        <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
        </button>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <div className="bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">在管患者</div>
          <div className="text-2xl font-bold mt-0.5">16</div>
        </div>
        <div className="bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">待护理</div>
          <div className="text-2xl font-bold mt-0.5">8</div>
        </div>
        <div className="bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">待给药</div>
          <div className="text-2xl font-bold mt-0.5">4</div>
        </div>
      </div>
    </div>

    <div className="px-4 -mt-4 space-y-4">
      <AICard
        title="AI 推送的护理任务"
        action={
          <button className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1">
            开始执行 <ArrowRight className="w-4 h-4" />
          </button>
        }
      >
        当前 8 项护理任务已按优先级智能排序，最紧急：303 床张建国 14:00 静脉给药。
      </AICard>

      <div>
        <SectionTitle title="护士工作台" />
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ClipboardCheck, label: "护理任务", color: "text-role-nurse bg-rose-50" },
            { icon: Pill, label: "给药操作", color: "text-warning bg-warning-soft" },
            { icon: HeartPulse, label: "生命体征", color: "text-destructive/80 bg-red-50" },
            { icon: BookOpen, label: "康复宣教", color: "text-ai bg-ai-soft" },
            { icon: Syringe, label: "注射记录", color: "text-primary bg-primary-soft" },
            { icon: Activity, label: "病情观察", color: "text-secondary bg-secondary-soft" },
            { icon: Users, label: "床位管理", color: "text-success bg-success-soft" },
            { icon: Stethoscope, label: "医嘱执行", color: "text-role-nurse bg-rose-50" },
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
        <SectionTitle title="紧急任务" extra={<span className="text-[10px] text-destructive font-semibold">2 项</span>} />
        <div className="bg-card rounded-2xl shadow-card p-3.5 border-l-4 border-l-destructive flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">303 床 · 张建国</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">静脉给药 · 阿司匹林 100mg</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">
            14:00
          </span>
        </div>
      </div>
    </div>
  </div>
);

const Tasks = () => (
  <div className="px-4 pt-4 pb-4">
    <h2 className="text-xl font-bold mb-1">护理任务清单</h2>
    <p className="text-xs text-muted-foreground mb-4">AI 智能排序 · 8 项待执行</p>

    <div className="flex gap-2 mb-4">
      <StatChip label="给药" value={4} accent="warning" />
      <StatChip label="护理" value={3} accent="primary" />
      <StatChip label="宣教" value={1} accent="ai" />
    </div>

    <div className="space-y-2">
      <NurseTaskCard
        bed="303"
        patient="张建国"
        task="静脉给药"
        detail="阿司匹林 100mg · IV"
        time="14:00"
        urgent
      />
      <NurseTaskCard
        bed="305"
        patient="王秀英"
        task="生命体征监测"
        detail="血压 + 心率"
        time="14:30"
      />
      <NurseTaskCard
        bed="307"
        patient="李 强"
        task="康复宣教"
        detail="出院后家庭训练指导"
        time="15:00"
      />
      <NurseTaskCard
        bed="310"
        patient="陈丽华"
        task="口服给药"
        detail="多奈哌齐 5mg"
        time="15:30"
      />
      <NurseTaskCard
        bed="312"
        patient="刘伟明"
        task="伤口换药"
        detail="术后第 5 天"
        time="16:00"
      />
    </div>
  </div>
);

const NurseTaskCard = ({
  bed,
  patient,
  task,
  detail,
  time,
  urgent,
}: {
  bed: string;
  patient: string;
  task: string;
  detail: string;
  time: string;
  urgent?: boolean;
}) => (
  <div className="bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3">
    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[10px] font-semibold ${urgent ? "gradient-nurse text-white" : "bg-muted text-muted-foreground"}`}>
      <span className="text-[9px] opacity-80">床号</span>
      <span className="text-base font-bold leading-none mt-0.5">{bed}</span>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] font-semibold">{patient}</span>
        {urgent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-bold">急</span>}
      </div>
      <div className="text-[12px] text-foreground/80 mt-0.5">{task}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{detail}</div>
    </div>
    <div className="text-right">
      <div className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
        <Clock className="w-3 h-3" /> {time}
      </div>
      <button className="mt-1.5 text-[11px] px-3 py-1 rounded-full gradient-nurse text-white font-semibold">
        执行
      </button>
    </div>
  </div>
);

const Edu = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="rounded-2xl p-5 gradient-nurse text-white relative overflow-hidden">
      <BookOpen className="absolute top-3 right-3 w-16 h-16 opacity-20" />
      <div className="text-xs opacity-80">康复宣教中心</div>
      <div className="text-2xl font-bold mt-1">AI 智能宣教</div>
      <div className="text-xs opacity-90 mt-2">个性化内容 · 一键推送给患者</div>
    </div>

    <AICard title="今日推荐宣教内容">
      <div className="space-y-2 text-[12px]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-ai" />
          <span>脑卒中后吞咽功能训练 · 给 3 位患者</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-ai" />
          <span>髋关节置换术后家庭防护 · 给 2 位患者</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-ai" />
          <span>用药安全与不良反应识别 · 给全部</span>
        </div>
      </div>
    </AICard>

    <SectionTitle title="宣教素材库" />
    <div className="grid grid-cols-2 gap-2">
      {[
        { title: "吞咽训练", count: 12, color: "gradient-doctor" },
        { title: "肢体康复", count: 28, color: "gradient-therapist" },
        { title: "用药指南", count: 16, color: "gradient-nurse" },
        { title: "心理疏导", count: 9, color: "gradient-ai" },
      ].map((c) => (
        <div key={c.title} className={`${c.color} rounded-2xl p-4 text-white relative overflow-hidden h-24`}>
          <div className="text-sm font-bold">{c.title}</div>
          <div className="text-[10px] opacity-80 mt-1">{c.count} 个素材</div>
          <ArrowRight className="absolute bottom-3 right-3 w-4 h-4 opacity-80" />
        </div>
      ))}
    </div>
  </div>
);

const Me = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-nurse flex items-center justify-center text-white text-xl font-bold">
        赵
      </div>
      <div>
        <div className="text-base font-bold">赵静怡 主管护师</div>
        <div className="text-xs text-muted-foreground mt-0.5">康复护理组 · 12 年</div>
      </div>
    </div>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["护理记录", "给药历史", "宣教记录", "排班", "设置"].map((it) => (
        <div key={it} className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  </div>
);
