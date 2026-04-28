import { useState } from "react";
import { ScreenShell, TabBar } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import {
  Bell,
  ChevronRight,
  ClipboardCheck,
  Target,
  FileText,
  Users,
  Sparkles,
  CheckCircle2,
  Activity,
  Stethoscope,
  Calendar,
  TrendingUp,
  ArrowRight,
  Video,
} from "lucide-react";

export const DoctorApp = () => {
  const [tab, setTab] = useState("home");

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="doctor" />}>
      {tab === "home" && <DoctorHome />}
      {tab === "tasks" && <DoctorTasks />}
      {tab === "ai" && <DoctorAI />}
      {tab === "me" && <DoctorMe />}
    </ScreenShell>
  );
};

const DoctorHome = () => (
  <div className="pb-4">
    {/* Header */}
    <div className="gradient-doctor px-5 pt-2 pb-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-xs opacity-80">早上好，李医师</div>
          <div className="text-lg font-semibold mt-0.5">仁济康复医院 · 神经康复科</div>
        </div>
        <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
        </button>
      </div>

      <div className="relative mt-5 flex gap-2">
        <div className="flex-1 bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">在管患者</div>
          <div className="text-2xl font-bold mt-0.5">28</div>
        </div>
        <div className="flex-1 bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">今日待评估</div>
          <div className="text-2xl font-bold mt-0.5">5</div>
        </div>
        <div className="flex-1 bg-white/15 backdrop-blur rounded-xl p-3">
          <div className="text-[11px] opacity-80">待确认方案</div>
          <div className="text-2xl font-bold mt-0.5">3</div>
        </div>
      </div>
    </div>

    <div className="px-4 -mt-4 space-y-4">
      {/* AI smart prompt */}
      <AICard
        title="AI 智能提醒"
        action={
          <button className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1">
            立即处理 <ArrowRight className="w-4 h-4" />
          </button>
        }
      >
        患者 <b>张建国</b> 的 FMA 评分较上周提升 8 分，建议在线召开团队评估，更新康复方案。
      </AICard>

      {/* Quick actions */}
      <div>
        <SectionTitle title="医师工作台" />
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ClipboardCheck, label: "首次评估", color: "text-primary bg-primary-soft" },
            { icon: Target, label: "康复目标", color: "text-secondary bg-secondary-soft" },
            { icon: FileText, label: "康复方案", color: "text-ai bg-ai-soft" },
            { icon: Users, label: "团队会议", color: "text-warning bg-warning-soft" },
            { icon: Stethoscope, label: "康复处方", color: "text-success bg-success-soft" },
            { icon: Activity, label: "持续评估", color: "text-primary bg-primary-soft" },
            { icon: TrendingUp, label: "出院方案", color: "text-secondary bg-secondary-soft" },
            { icon: Video, label: "线上会诊", color: "text-ai bg-ai-soft" },
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

      {/* Pending tasks */}
      <div>
        <SectionTitle
          title="待处理事项"
          extra={
            <button className="text-xs text-primary font-medium flex items-center">
              全部 <ChevronRight className="w-3 h-3" />
            </button>
          }
        />
        <div className="space-y-2">
          <PatientTaskCard
            patient="张建国 · 男 · 56岁"
            tag="脑卒中后遗症"
            task="待确认 AI 生成的康复方案 V2"
            urgency="high"
            time="10:30 团队会议"
          />
          <PatientTaskCard
            patient="王秀英 · 女 · 68岁"
            tag="髋关节置换术后"
            task="首次康复评估 · 等待团队线上接入"
            urgency="medium"
            time="14:00"
          />
          <PatientTaskCard
            patient="李 强 · 男 · 42岁"
            tag="脊髓损伤"
            task="出院二级方案待调整确认"
            urgency="low"
            time="今日"
          />
        </div>
      </div>

      {/* Patient progress */}
      <div>
        <SectionTitle title="今日康复进展" />
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">第 38 周 · 平均达成率</span>
            </div>
            <span className="text-success text-sm font-bold">↑ 12%</span>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {[40, 55, 48, 70, 65, 82, 78].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md gradient-doctor opacity-90"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-muted-foreground">
                  {["一", "二", "三", "四", "五", "六", "日"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PatientTaskCard = ({
  patient,
  tag,
  task,
  urgency,
  time,
}: {
  patient: string;
  tag: string;
  task: string;
  urgency: "high" | "medium" | "low";
  time: string;
}) => {
  const urgencyMap = {
    high: { color: "bg-destructive/10 text-destructive", label: "紧急" },
    medium: { color: "bg-warning/15 text-warning", label: "重要" },
    low: { color: "bg-primary/10 text-primary", label: "常规" },
  }[urgency];
  return (
    <div className="bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99] transition-transform">
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="text-[13px] font-semibold text-foreground">{patient}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{tag}</div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${urgencyMap.color}`}>
          {urgencyMap.label}
        </span>
      </div>
      <div className="text-[12px] text-foreground/80 leading-relaxed">{task}</div>
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/60">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {time}
        </span>
        <button className="text-[11px] text-primary font-semibold flex items-center">
          处理 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const DoctorTasks = () => (
  <div className="px-4 pt-4 pb-4">
    <h2 className="text-xl font-bold mb-1">康复评估与方案</h2>
    <p className="text-xs text-muted-foreground mb-4">AI 协同 · 团队会诊全流程</p>

    <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">张建国 · 第 12 天</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">脑卒中后偏瘫</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-success-soft text-success font-semibold">
          评估中
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <StatChip label="FMA 评分" value="42" accent="primary" />
          <StatChip label="MMSE" value="26" accent="success" />
          <StatChip label="Barthel" value="55" accent="warning" />
        </div>

        <AICard
          title="AI 康复目标建议"
          action={
            <div className="flex gap-2">
              <button className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold">
                手动调整
              </button>
              <button className="flex-1 bg-ai text-ai-foreground rounded-xl py-2 text-xs font-semibold">
                同步治疗师
              </button>
            </div>
          }
        >
          <div className="space-y-1.5 text-[12px]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ai mt-0.5 shrink-0" />
              <span>4 周内步行距离 ≥ 50m（独立）</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ai mt-0.5 shrink-0" />
              <span>右上肢 Brunnstrom 提升至 IV 级</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ai mt-0.5 shrink-0" />
              <span>独立完成穿衣、如厕等基础 ADL</span>
            </div>
          </div>
        </AICard>
      </div>
    </div>

    <SectionTitle title="评估流程" />
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
      {[
        { step: "01", title: "首次康复评估", desc: "团队线上完成 · 5/5", done: true },
        { step: "02", title: "AI 生成康复目标", desc: "已确认", done: true },
        { step: "03", title: "团队会议确认方案", desc: "10:30 待召开", done: false, active: true },
        { step: "04", title: "确认 AI 处方建议", desc: "等待中", done: false },
        { step: "05", title: "持续评估 + 出院方案", desc: "—", done: false },
      ].map((s) => (
        <div key={s.step} className="flex gap-3 items-start">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
              s.done
                ? "bg-success text-success-foreground"
                : s.active
                ? "gradient-doctor text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.step}
          </div>
          <div className="flex-1 pt-0.5">
            <div className="text-[13px] font-semibold text-foreground">{s.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DoctorAI = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="rounded-2xl p-5 gradient-ai text-white relative overflow-hidden">
      <Sparkles className="absolute top-3 right-3 w-16 h-16 opacity-20" />
      <div className="text-xs opacity-80">康复智能体</div>
      <div className="text-2xl font-bold mt-1">RehabGPT 4.0</div>
      <div className="text-xs opacity-90 mt-2">基于 12,000+ 真实病例训练</div>
    </div>

    <AICard
      title="AI 智能更新方案"
      action={
        <button className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold">
          应用方案
        </button>
      }
    >
      根据张建国近 7 日评估数据，建议提升下肢 PT 训练强度 20%，增加平衡训练 2 次/日。
    </AICard>

    <AICard title="AI 二级方案（院外）">
      检测到患者满足出院条件。已生成包含家庭训练计划、远程随访周期与紧急情况预警的院外方案。
    </AICard>

    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold mb-3">与 AI 对话</div>
      <div className="space-y-2 mb-3">
        <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 text-xs max-w-[85%]">
          这位患者的肌张力如何调整？
        </div>
        <div className="bg-ai-soft rounded-xl rounded-tr-sm px-3 py-2 text-xs ml-auto max-w-[85%] border border-ai/20">
          建议先评估 MAS 分级，若 ≥ 2 级可联合 BTX-A 注射 + 牵伸训练。已生成详细处方草案。
        </div>
      </div>
      <div className="flex gap-2 items-center bg-muted rounded-full px-3 py-2">
        <input
          placeholder="向 AI 提问..."
          className="flex-1 bg-transparent text-xs outline-none"
          readOnly
        />
        <button className="w-7 h-7 rounded-full gradient-ai flex items-center justify-center">
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  </div>
);

const DoctorMe = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-doctor flex items-center justify-center text-white text-xl font-bold">
        李
      </div>
      <div>
        <div className="text-base font-bold">李志远 主任医师</div>
        <div className="text-xs text-muted-foreground mt-0.5">神经康复科 · 从业 18 年</div>
        <div className="flex gap-1.5 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
            脑卒中
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-soft text-secondary font-medium">
            脊髓损伤
          </span>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["我的患者", "评估记录", "团队管理", "AI 偏好设置", "帮助与反馈"].map((it) => (
        <div key={it} className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  </div>
);
