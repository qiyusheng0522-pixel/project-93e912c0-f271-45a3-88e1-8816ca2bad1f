import { useState } from "react";
import { ScreenShell, TabBar } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { toast } from "sonner";
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
  Edit3,
} from "lucide-react";

type SheetKey =
  | null
  | "confirmAssess"
  | "goal"
  | "schedule"
  | "rx"
  | "exec"
  | "summary"
  | "checkin"
  | "med"
  | "patient";

export const TherapistApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const open = (k: SheetKey) => setSheet(k);
  const close = () => setSheet(null);

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="therapist" />}>
      {tab === "home" && <Home onOpen={open} />}
      {tab === "tasks" && <TaskList onOpen={open} />}
      {tab === "ai" && <AIPanel onOpen={open} />}
      {tab === "me" && <Me />}

      <PhoneSheet open={sheet === "confirmAssess"} onClose={close} title="评估结果确认" accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已请医师再次评估"); close(); }} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">结果不确定</button>
          <button onClick={() => { toast.success("评估已确认 · 进入目标设定"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认结果</button>
        </div>}>
        <ConfirmAssessSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title="自定义调整治疗目标" accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("调整后的目标已回传医师"); close(); }}>保存调整</PrimaryBtn>}>
        <GoalAdjustSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "schedule"} onClose={close} title="智能排班 · 手动调整" accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("排班已保存"); close(); }}>保存排班</PrimaryBtn>}>
        <ScheduleSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "rx"} onClose={close} title="确认 / 调整 AI 处方" accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已申请医师复核"); close(); }} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">申请医师复核</button>
          <button onClick={() => { toast.success("处方已确认 · 待医师签发"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认处方</button>
        </div>}>
        <RxAdjustSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "exec"} onClose={close} title="处方执行 · 李强" accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { open("summary"); }}>完成 · 写工作小结</PrimaryBtn>}>
        <ExecSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "summary"} onClose={close} title="今日工作小结" accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("小结已提交，已同步医师端"); close(); }}>提交小结</PrimaryBtn>}>
        <SummarySheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "checkin"} onClose={close} title="打卡记录" accent="therapist">
        <CheckinSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "med"} onClose={close} title="药物变动记录" accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("药物变动已记录"); close(); }}>保存记录</PrimaryBtn>}>
        <MedSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patient"} onClose={close} title="患者治疗档案" accent="therapist">
        <PatientSheet onOpen={open} />
      </PhoneSheet>
    </ScreenShell>
  );
};

const Home = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => (
  <div className="pb-4">
    <div className="gradient-therapist px-5 pt-2 pb-8 text-white relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-xs opacity-80">下午好，王治疗师</div>
          <div className="text-lg font-semibold mt-0.5">PT 物理治疗 · 三楼训练室</div>
        </div>
        <button onClick={() => toast("您有 2 条新任务")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
        </button>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <div className="bg-white/15 backdrop-blur rounded-xl p-3"><div className="text-[11px] opacity-80">今日治疗</div><div className="text-2xl font-bold mt-0.5">12</div></div>
        <div className="bg-white/15 backdrop-blur rounded-xl p-3"><div className="text-[11px] opacity-80">已完成</div><div className="text-2xl font-bold mt-0.5">7</div></div>
        <div className="bg-white/15 backdrop-blur rounded-xl p-3"><div className="text-[11px] opacity-80">待打卡</div><div className="text-2xl font-bold mt-0.5">5</div></div>
      </div>
    </div>

    <div className="px-4 -mt-4 space-y-4">
      <AICard title="AI 推送的治疗任务" action={
        <button onClick={() => onOpen("exec")} className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1">
          开始执行最近一项 <ArrowRight className="w-4 h-4" />
        </button>
      }>
        基于今日排班，AI 已为你智能编排 5 个治疗时段，平均利用率 92%。
      </AICard>

      <div>
        <SectionTitle title="治疗师工作台" />
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ClipboardList, label: "评估确认", color: "text-secondary bg-secondary-soft", k: "confirmAssess" as SheetKey },
            { icon: Activity, label: "治疗目标", color: "text-primary bg-primary-soft", k: "goal" as SheetKey },
            { icon: Calendar, label: "智能排班", color: "text-ai bg-ai-soft", k: "schedule" as SheetKey },
            { icon: Dumbbell, label: "康复处方", color: "text-success bg-success-soft", k: "rx" as SheetKey },
            { icon: Brain, label: "OT/ST", color: "text-warning bg-warning-soft", k: "exec" as SheetKey },
            { icon: CheckCircle2, label: "打卡记录", color: "text-secondary bg-secondary-soft", k: "checkin" as SheetKey },
            { icon: MessageSquare, label: "工作小结", color: "text-primary bg-primary-soft", k: "summary" as SheetKey },
            { icon: Pill, label: "药物变动", color: "text-ai bg-ai-soft", k: "med" as SheetKey },
          ].map((it) => (
            <button key={it.label} onClick={() => onOpen(it.k)} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card active:scale-95 transition-transform">
              <div className={`w-9 h-9 rounded-xl ${it.color} flex items-center justify-center`}>
                <it.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] text-foreground font-medium">{it.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="今日排班" extra={<button onClick={() => onOpen("schedule")} className="text-[11px] text-secondary font-semibold">手动调整</button>} />
        <div className="space-y-2">
          <ScheduleCard onClick={() => onOpen("patient")} time="09:00" patient="张建国" type="PT · 步态训练" status="done" room="A-301" />
          <ScheduleCard onClick={() => onOpen("patient")} time="10:30" patient="王秀英" type="PT · 关节松动" status="done" room="A-303" />
          <ScheduleCard onClick={() => onOpen("exec")} time="14:00" patient="李 强" type="OT · ADL 训练" status="active" room="B-201" />
          <ScheduleCard onClick={() => onOpen("exec")} time="15:30" patient="陈丽华" type="ST · 吞咽训练" status="upcoming" room="B-205" />
          <ScheduleCard onClick={() => onOpen("exec")} time="16:30" patient="刘伟明" type="PT · 平衡训练" status="upcoming" room="A-301" />
        </div>
      </div>
    </div>
  </div>
);

const ScheduleCard = ({ time, patient, type, status, room, onClick }: { time: string; patient: string; type: string; status: "done" | "active" | "upcoming"; room: string; onClick?: () => void; }) => {
  const sm = {
    done: { color: "bg-success-soft text-success", label: "已完成", border: "border-l-success" },
    active: { color: "bg-secondary-soft text-secondary", label: "进行中", border: "border-l-secondary" },
    upcoming: { color: "bg-muted text-muted-foreground", label: "待开始", border: "border-l-border" },
  }[status];
  return (
    <button onClick={onClick} className={`w-full text-left bg-card rounded-2xl shadow-card p-3.5 border-l-4 ${sm.border} flex items-center gap-3`}>
      <div className="text-center">
        <div className="text-sm font-bold text-foreground">{time}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{room}</div>
      </div>
      <div className="flex-1 border-l border-border/60 pl-3">
        <div className="text-[13px] font-semibold">{patient}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{type}</div>
      </div>
      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${sm.color}`}>{sm.label}</span>
    </button>
  );
};

const TaskList = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => {
  const [items, setItems] = useState([
    { name: "坐位躯干稳定", set: "3 组 × 10 次", done: true },
    { name: "精细抓握训练", set: "2 组 × 15 次", done: true },
    { name: "日常穿衣模拟", set: "20 分钟", done: true },
    { name: "厨房活动训练", set: "25 分钟", done: false, active: true },
    { name: "书写训练", set: "15 分钟", done: false },
  ]);
  const doneCount = items.filter((i) => i.done).length;
  const toggle = (idx: number) => {
    setItems((arr) => arr.map((it, i) => i === idx ? { ...it, done: !it.done, active: false } : it));
    toast.success("已打卡");
  };
  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="text-xl font-bold mb-1">康复处方执行</h2>
      <p className="text-xs text-muted-foreground mb-4">李 强 · OT 训练 · 14:00</p>

      <div className="bg-card rounded-2xl shadow-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">今日处方进度</div>
          <span className="text-secondary text-sm font-bold">{doneCount}/{items.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-therapist transition-all" style={{ width: `${(doneCount / items.length) * 100}%` }} />
        </div>
      </div>

      <SectionTitle title="处方项目" />
      <div className="space-y-2 mb-4">
        {items.map((it, idx) => (
          <ExerciseItem key={it.name} {...it} onToggle={() => toggle(idx)} />
        ))}
      </div>

      <button onClick={() => onOpen("summary")} className="w-full gradient-therapist text-white rounded-2xl py-3.5 text-sm font-semibold shadow-card flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> 完成打卡 + 记录小结
      </button>
    </div>
  );
};

const ExerciseItem = ({ name, set, done, active, onToggle }: { name: string; set: string; done?: boolean; active?: boolean; onToggle?: () => void; }) => (
  <div className="bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${done ? "bg-success text-success-foreground" : active ? "gradient-therapist text-white" : "bg-muted text-muted-foreground"}`}>
      {done ? <CheckCircle2 className="w-5 h-5" /> : active ? <PlayCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
    </div>
    <div className="flex-1">
      <div className="text-[13px] font-semibold">{name}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{set}</div>
    </div>
    <button onClick={onToggle} className={`text-[11px] px-3 py-1 rounded-full font-semibold ${done ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"}`}>
      {done ? "撤销" : "打卡"}
    </button>
  </div>
);

const AIPanel = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <AICard title="AI 调整后的治疗目标" action={
      <div className="flex gap-2">
        <button onClick={() => onOpen("goal")} className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold">自定义调整</button>
        <button onClick={() => toast.success("已确认应用")} className="flex-1 bg-ai text-ai-foreground rounded-xl py-2 text-xs font-semibold">确认应用</button>
      </div>
    }>
      AI 将李强本周 ADL 目标提升至 70 分（+5），并新增 OT 厨房训练任务。
    </AICard>

    <AICard title="AI 排班建议" action={
      <button onClick={() => onOpen("schedule")} className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold">手动微调排班</button>
    }>
      明日治疗时段共 8 个，AI 已根据资源平台空闲时间智能编排，节省调度时间约 35 分钟。
    </AICard>

    <AICard title="AI 处方建议" action={
      <button onClick={() => onOpen("rx")} className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold">查看处方</button>
    }>
      检测到患者王秀英髋关节活动度提升明显，建议在原 PT 处方中加入站立位平衡训练。
    </AICard>
  </div>
);

const Me = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-therapist flex items-center justify-center text-white text-xl font-bold">王</div>
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
        <button key={it} onClick={() => toast(it + " · 即将开放")} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===================== Sheets ===================== */

const ConfirmAssessSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="医师推送的评估结果">
      患者：王秀英 · 髋关节置换术后。Harris 65 分 / Berg 32 / VAS 6。
    </AICard>
    <SectionTitle title="逐项确认" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="Harris 髋关节" value="65 ✓" />
      <FormRow label="Berg 平衡" value="32 ✓" />
      <FormRow label="VAS 疼痛" value="6 ⚠️" hint="较高，建议先疼痛干预" />
      <FormRow label="ROM 屈曲" value="待补充" />
    </div>
    <textarea placeholder="补充治疗师观察..." className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-20 outline-none" />
  </div>
);

const GoalAdjustSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="AI 推送的目标 · 可自定义调整">基于评估自动生成，治疗师可微调更贴合实际训练。</AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="ADL Barthel" value={<input defaultValue="70" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="AI 建议 70" />
      <FormRow label="步行距离" value={<input defaultValue="50" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="米 · AI 建议 50" />
      <FormRow label="FMA 提升" value={<input defaultValue="8" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="分 · AI 建议 8" />
      <FormRow label="目标周期" value={<input defaultValue="4" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="周" />
    </div>
  </div>
);

const ScheduleSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="资源平台 AI 自动排班">已根据治疗师空闲时段、训练室占用、患者偏好生成排班，可拖动调整。</AICard>
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2">
      {["09:00 张建国 · A-301", "10:30 王秀英 · A-303", "14:00 李 强 · B-201", "15:30 陈丽华 · B-205", "16:30 刘伟明 · A-301"].map((s) => (
        <div key={s} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
          <span className="text-[12px]">{s}</span>
          <div className="flex gap-1">
            <button className="text-[10px] px-2 py-1 rounded bg-muted">改时间</button>
            <button className="text-[10px] px-2 py-1 rounded bg-muted">换室</button>
          </div>
        </div>
      ))}
    </div>
    <button className="w-full text-xs text-ai font-semibold py-2">+ 新增治疗时段</button>
  </div>
);

const RxAdjustSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="医师签发 · AI 处方建议">可调整每项参数，确认后回传医师二次签发。</AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {[
        { t: "PT", n: "下肢力量", s: "3×10" },
        { t: "PT", n: "平衡板", s: "15min" },
        { t: "OT", n: "穿衣 ADL", s: "20min" },
        { t: "OT", n: "厨房活动", s: "25min" },
        { t: "ST", n: "构音训练", s: "30min" },
      ].map((r) => (
        <div key={r.n} className="flex items-center gap-3 py-3">
          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary-soft text-secondary font-bold">{r.t}</span>
          <div className="flex-1">
            <div className="text-[12px] font-semibold">{r.n}</div>
            <div className="text-[10px] text-muted-foreground">{r.s}</div>
          </div>
          <button className="text-secondary"><Edit3 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  </div>
);

const ExecSheet = () => (
  <div className="p-4 space-y-3">
    <div className="rounded-2xl gradient-therapist text-white p-5">
      <div className="text-xs opacity-80">正在执行 · OT</div>
      <div className="text-xl font-bold mt-1">厨房活动训练</div>
      <div className="text-xs opacity-90 mt-2">25 分钟 · 已用 12:30</div>
    </div>
    <SectionTitle title="动作分解 · AI 引导" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["站立位取物", "持物移动 1m", "切菜动作模拟", "倒水 + 端杯", "整理收纳"].map((a, i) => (
        <FormRow key={a} label={`${i + 1}. ${a}`} value={i < 2 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Clock className="w-4 h-4 text-muted-foreground" />} />
      ))}
    </div>
    <AICard title="实时反馈">患者本次任务负重耐受良好，建议下次增加 5min。</AICard>
  </div>
);

const SummarySheet = () => (
  <div className="p-4 space-y-3">
    <SectionTitle title="今日工作小结 · 李强" />
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
      <div>
        <div className="text-[11px] text-muted-foreground mb-1">完成训练</div>
        <div className="text-sm font-semibold">5 / 5 项 · 累计 95 分钟</div>
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground mb-1">主观感受 (Borg)</div>
        <div className="flex gap-1">
          {[6, 7, 8, 9, 10, 11, 12].map((n) => (
            <button key={n} className={`flex-1 py-2 rounded-lg text-xs ${n === 9 ? "gradient-therapist text-white" : "bg-muted"}`}>{n}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground mb-1">治疗记录</div>
        <textarea defaultValue="患者今日完成全部 OT 任务，厨房活动表现明显改善，建议明日加入精细动作训练。" className="w-full bg-muted rounded-xl p-3 text-xs h-24 outline-none" />
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground mb-1">异常 / 不良反应</div>
        <input placeholder="无 / 描述..." className="w-full bg-muted rounded-xl p-3 text-xs outline-none" />
      </div>
    </div>
  </div>
);

const CheckinSheet = () => (
  <div className="p-4 space-y-3">
    <SectionTitle title="今日打卡" />
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2">
      {[
        { t: "09:15", p: "张建国", a: "PT 步态训练 · 已完成" },
        { t: "10:48", p: "王秀英", a: "PT 关节松动 · 已完成" },
        { t: "14:32", p: "李 强", a: "OT ADL · 进行中" },
      ].map((c) => (
        <div key={c.t} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
          <div className="text-[11px] font-semibold w-12">{c.t}</div>
          <div className="flex-1">
            <div className="text-[12px] font-semibold">{c.p}</div>
            <div className="text-[10px] text-muted-foreground">{c.a}</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-success" />
        </div>
      ))}
    </div>
  </div>
);

const MedSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="药物变动联动护士端">治疗师观察到的药物相关反馈将同步医生与护士。</AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value="李 强 ▾" />
      <FormRow label="药物" value="巴氯芬 ▾" />
      <FormRow label="变动类型" value="剂量调整 ▾" />
      <FormRow label="新剂量" value={<input defaultValue="10mg bid" className="w-24 bg-muted rounded px-2 py-1 text-xs text-right" />} />
    </div>
    <textarea placeholder="变动原因 / 治疗师观察..." className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-20 outline-none" />
  </div>
);

const PatientSheet = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-bold">张建国 · 男 56 岁</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">脑卒中后偏瘫 · 入院 12 天</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatChip label="FMA" value="42" accent="primary" />
        <StatChip label="Berg" value="36" accent="success" />
        <StatChip label="完成率" value="94%" accent="warning" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <button onClick={() => onOpen("exec")} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card">
        <PlayCircle className="w-5 h-5 text-secondary" /><span className="text-[11px]">开始治疗</span>
      </button>
      <button onClick={() => onOpen("rx")} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card">
        <Dumbbell className="w-5 h-5 text-secondary" /><span className="text-[11px]">查看处方</span>
      </button>
      <button onClick={() => onOpen("summary")} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card">
        <MessageSquare className="w-5 h-5 text-secondary" /><span className="text-[11px]">写小结</span>
      </button>
    </div>
  </div>
);
