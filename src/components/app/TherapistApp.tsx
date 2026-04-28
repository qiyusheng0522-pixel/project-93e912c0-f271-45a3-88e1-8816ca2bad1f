import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, TodoItem } from "@/components/app/TodoQueue";
import {
  PatientsPage,
  PatientDetailSheet,
  AddNoteSheet,
  TeamManageSheet,
  Patient,
  PatientFilter,
  NEW_PATIENT_COUNT,
} from "@/components/app/PatientsModule";
import { RehabPlanModule, AIRxModule, PlanStage, AIRxBucket } from "@/components/app/RehabPlanModule";
import { Home as HomeIcon, UsersRound, FileHeart, Sparkles, User as UserIcon } from "lucide-react";
const THERAPIST_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: HomeIcon },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "plan", label: "康复方案", icon: FileHeart },
  { key: "ai", label: "AI康复处方", icon: Sparkles },
  { key: "me", label: "我的", icon: UserIcon },
];
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
  Stethoscope,
  Users,
  AlertTriangle,
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
  | "patient"
  | "patientDetail"
  | "addNote"
  | "team";

type QueueKey =
  | "confirmAssess"
  | "goal"
  | "rx"
  | "exec"
  | "summary"
  | "med";

const QUEUE_TITLE: Record<QueueKey, string> = {
  confirmAssess: "待确认评估结果",
  goal: "待自定义调整治疗目标",
  rx: "待确认 / 调整 AI 处方",
  exec: "待执行康复处方",
  summary: "待写工作小结",
  med: "待记录药物变动",
};

const QUEUES: Record<QueueKey, TodoItem[]> = {
  confirmAssess: [
    { id: "ca1", patient: "王秀英 · 女 68", meta: "髋关节置换术后", detail: "Harris 65 / Berg 32 / VAS 6 · 待治疗师判定", urgency: "high" },
    { id: "ca2", patient: "周建华 · 男 72", meta: "脑梗死恢复期", detail: "FMA 38 · 待确认", urgency: "medium" },
    { id: "ca3", patient: "孙德强 · 男 60", meta: "膝关节置换术后", detail: "ROM 评估待确认", urgency: "low" },
  ],
  goal: [
    { id: "go1", patient: "李 强 · 男 42", meta: "脊髓损伤", detail: "AI 推送 ADL 目标 70，可微调", urgency: "high" },
    { id: "go2", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "AI 推送步行 50m 目标", urgency: "medium" },
    { id: "go3", patient: "陈丽华 · 女 65", meta: "认知障碍", detail: "MMSE 目标待调整", urgency: "low" },
  ],
  rx: [
    { id: "rx1", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "AI 处方建议 · PT/OT/ST 综合", urgency: "high" },
    { id: "rx2", patient: "王秀英 · 女 68", meta: "髋关节术后", detail: "新增站立位平衡训练建议", urgency: "medium" },
    { id: "rx3", patient: "李 强 · 男 42", meta: "脊髓损伤", detail: "OT 强度调整建议", urgency: "medium" },
  ],
  exec: [
    { id: "e1", patient: "李 强 · 男 42", meta: "OT · ADL 训练", detail: "厨房活动训练 25min · B-201", time: "14:00", urgency: "high" },
    { id: "e2", patient: "陈丽华 · 女 65", meta: "ST · 吞咽训练", detail: "B-205 · 30 min", time: "15:30", urgency: "medium" },
    { id: "e3", patient: "刘伟明 · 男 38", meta: "PT · 平衡训练", detail: "A-301 · 45 min", time: "16:30", urgency: "medium" },
    { id: "e4", patient: "黄彩霞 · 女 72", meta: "PT · 关节松动", detail: "A-303 · 30 min", time: "17:15", urgency: "low" },
    { id: "e5", patient: "钱志国 · 男 65", meta: "OT · 精细动作", detail: "B-202 · 25 min", time: "18:00", urgency: "low" },
  ],
  summary: [
    { id: "s1", patient: "张建国", meta: "上午 PT 步态训练", detail: "5/5 完成 · 待提交小结", urgency: "medium" },
    { id: "s2", patient: "王秀英", meta: "上午 PT 关节松动", detail: "4/4 完成 · 待提交小结", urgency: "medium" },
    { id: "s3", patient: "李 强", meta: "下午 OT 训练", detail: "进行中 · 待提交", urgency: "low" },
  ],
  med: [
    { id: "m1", patient: "李 强", meta: "巴氯芬剂量调整", detail: "10mg bid → 待记录上报医师/护士", urgency: "medium" },
    { id: "m2", patient: "张建国", meta: "肌张力相关用药观察", detail: "待补充观察记录", urgency: "low" },
  ],
};

export const TherapistApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [queue, setQueue] = useState<QueueKey | null>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const [pickedPatient, setPickedPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, Patient["notes"]>>({});
  const open = (k: SheetKey) => setSheet(k);
  const close = () => setSheet(null);
  const openQueue = (k: QueueKey) => setQueue(k);
  const closeQueue = () => setQueue(null);
  const pickFromQueue = (item: TodoItem, sheetKey: SheetKey) => {
    setActivePatient(item.patient);
    setQueue(null);
    setSheet(sheetKey);
  };
  const pickPatient = (p: Patient) => {
    const merged = { ...p, notes: patientNotes[p.id] ?? p.notes };
    setPickedPatient(merged);
    setSheet("patientDetail");
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="therapist" newPatientCount={NEW_PATIENT_COUNT} items={THERAPIST_TABS} />}>
      {tab === "home" && <Home onOpen={open} onOpenQueue={openQueue} onGoPatients={() => setTab("patients")} />}
      {tab === "patients" && <PatientsPage accent="therapist" onPick={pickPatient} />}
      {tab === "plan" && <RehabPlanModule accent="therapist" initialStage="goal" onPickPlan={(_s, p) => { setActivePatient(`${p.name} · 床${p.bed}`); setSheet("goal"); }} />}
      {tab === "ai" && <AIRxModule accent="therapist" onPick={(_b, p) => { setActivePatient(`${p.name} · 床${p.bed}`); setSheet("rx"); }} />}
      {tab === "me" && <Me onOpenTeam={() => open("team")} />}

      {(["confirmAssess", "goal", "rx", "exec", "summary", "med"] as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="therapist">
          <TodoQueueList accent="therapist" items={QUEUES[k]} onPick={(item) => pickFromQueue(item, k as SheetKey)} />
        </PhoneSheet>
      ))}

      <PhoneSheet open={sheet === "confirmAssess"} onClose={close} title={`评估结果确认${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已请医师再次评估"); close(); }} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">结果不确定</button>
          <button onClick={() => { toast.success("评估已确认 · 进入目标设定"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认结果</button>
        </div>}>
        <ConfirmAssessSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title={`自定义调整治疗目标${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("调整后的目标已回传医师"); close(); }}>保存调整</PrimaryBtn>}>
        <GoalAdjustSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "schedule"} onClose={close} title="智能排班 · 手动调整" accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("排班已保存"); close(); }}>保存排班</PrimaryBtn>}>
        <ScheduleSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "rx"} onClose={close} title={`确认 / 调整 AI 处方${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已申请医师复核"); close(); }} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">申请医师复核</button>
          <button onClick={() => { toast.success("处方已确认 · 待医师签发"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认处方</button>
        </div>}>
        <RxAdjustSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "exec"} onClose={close} title={`处方执行${activePatient ? " · " + activePatient.split(" ")[0] : " · 李强"}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { open("summary"); }}>完成 · 写工作小结</PrimaryBtn>}>
        <ExecSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "summary"} onClose={close} title={`今日工作小结${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("小结已提交，已同步医师端"); close(); }}>提交小结</PrimaryBtn>}>
        <SummarySheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "checkin"} onClose={close} title="打卡记录" accent="therapist">
        <CheckinSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "med"} onClose={close} title={`药物变动记录${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("药物变动已记录"); close(); }}>保存记录</PrimaryBtn>}>
        <MedSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patient"} onClose={close} title="患者治疗档案" accent="therapist">
        <PatientSheet onOpen={open} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientDetail"} onClose={close} title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`} accent="therapist">
        <PatientDetailSheet
          patient={pickedPatient}
          accent="therapist"
          onAddNote={() => setSheet("addNote")}
          onShare={() => toast.success("已打开共享设置")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "addNote"} onClose={() => setSheet("patientDetail")} title="添加患者备注" accent="therapist">
        <AddNoteSheet
          patient={pickedPatient}
          accent="therapist"
          onSave={(text) => {
            if (!pickedPatient) return;
            const newNote = { author: "王治疗师", time: "刚刚", text };
            const updated = [newNote, ...(patientNotes[pickedPatient.id] ?? pickedPatient.notes)];
            setPatientNotes({ ...patientNotes, [pickedPatient.id]: updated });
            setPickedPatient({ ...pickedPatient, notes: updated });
            toast.success("备注已保存并共享给团队");
            setSheet("patientDetail");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "team"} onClose={close} title="团队管理" accent="therapist">
        <TeamManageSheet accent="therapist" />
      </PhoneSheet>
    </ScreenShell>
  );
};

const Home = ({
  onOpen,
  onOpenQueue,
  onGoPatients,
}: {
  onOpen: (k: SheetKey) => void;
  onOpenQueue: (k: QueueKey) => void;
  onGoPatients: () => void;
}) => {
  const tiles: { icon: any; label: string; color: string; k: QueueKey }[] = [
    { icon: ClipboardList, label: "评估确认", color: "text-secondary bg-secondary-soft", k: "confirmAssess" },
    { icon: Activity, label: "治疗目标", color: "text-primary bg-primary-soft", k: "goal" },
    { icon: Dumbbell, label: "康复处方", color: "text-success bg-success-soft", k: "rx" },
    { icon: Brain, label: "处方执行", color: "text-warning bg-warning-soft", k: "exec" },
    { icon: MessageSquare, label: "工作小结", color: "text-primary bg-primary-soft", k: "summary" },
    { icon: Pill, label: "药物变动", color: "text-ai bg-ai-soft", k: "med" },
  ];
  return (
    <div className="pb-4">
      <div className="gradient-therapist px-5 pt-2 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">下午好</div>
            <div className="text-xl font-bold mt-0.5">王治疗师 👋</div>
          </div>
          <button onClick={() => toast("您有 2 条新任务")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>

        <div className="relative mt-5">
          <PendingStatRow
            items={[
              { label: "待执行处方", count: QUEUES.exec.length, onClick: () => onOpenQueue("exec") },
              { label: "待确认处方", count: QUEUES.rx.length, onClick: () => onOpenQueue("rx") },
              { label: "待写小结", count: QUEUES.summary.length, onClick: () => onOpenQueue("summary") },
            ]}
          />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {NEW_PATIENT_COUNT > 0 && (
          <button onClick={onGoPatients} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3 border-l-4 border-l-warning active:scale-[0.99]">
            <div className="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">有 {NEW_PATIENT_COUNT} 位新患者</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">前往患者管理查看共享患者档案</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <div>
          <SectionTitle title="治疗师工作台 · 点击查看待办列表" />
          <div className="grid grid-cols-4 gap-2">
            {tiles.map((it) => (
              <WorkbenchTile
                key={it.label}
                icon={it.icon}
                label={it.label}
                color={it.color}
                count={QUEUES[it.k].length}
                onClick={() => onOpenQueue(it.k)}
              />
            ))}
            <WorkbenchTile icon={Calendar} label="智能排班" color="text-ai bg-ai-soft" onClick={() => onOpen("schedule")} />
            <WorkbenchTile icon={CheckCircle2} label="打卡记录" color="text-secondary bg-secondary-soft" onClick={() => onOpen("checkin")} />
            <WorkbenchTile icon={UsersRound} label="患者管理" color="text-role-therapist bg-secondary-soft" count={NEW_PATIENT_COUNT} onClick={onGoPatients} />
          </div>
        </div>

        <div>
          <SectionTitle title="今日排班" extra={<button onClick={() => onOpen("schedule")} className="text-[11px] text-secondary font-semibold">手动调整</button>} />
          <div className="space-y-2">
            <ScheduleCard onClick={() => onOpen("patient")} time="09:00" patient="张建国" type="PT · 步态训练" status="done" room="A-301" />
            <ScheduleCard onClick={() => onOpen("patient")} time="10:30" patient="王秀英" type="PT · 关节松动" status="done" room="A-303" />
            <ScheduleCard onClick={() => onOpenQueue("exec")} time="14:00" patient="李 强" type="OT · ADL 训练" status="active" room="B-201" />
            <ScheduleCard onClick={() => onOpenQueue("exec")} time="15:30" patient="陈丽华" type="ST · 吞咽训练" status="upcoming" room="B-205" />
            <ScheduleCard onClick={() => onOpenQueue("exec")} time="16:30" patient="刘伟明" type="PT · 平衡训练" status="upcoming" room="A-301" />
          </div>
        </div>
      </div>
    </div>
  );
};

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

const TaskList = ({
  onOpen,
  onOpenQueue,
}: {
  onOpen: (k: SheetKey) => void;
  onOpenQueue: (k: QueueKey) => void;
}) => {
  const queues: { k: QueueKey; label: string; desc: string; icon: any; color: string }[] = [
    { k: "confirmAssess", label: "评估结果确认", desc: "对医师推送的评估判定", icon: ClipboardList, color: "bg-secondary-soft text-secondary" },
    { k: "goal", label: "治疗目标调整", desc: "AI 智能 · 自定义微调", icon: Activity, color: "bg-primary-soft text-primary" },
    { k: "rx", label: "AI 处方确认", desc: "确认 / 调整后回传医师", icon: Dumbbell, color: "bg-success-soft text-success" },
    { k: "exec", label: "处方执行", desc: "PT / OT / ST", icon: Brain, color: "bg-warning-soft text-warning" },
    { k: "summary", label: "工作小结", desc: "每日打卡 + 治疗记录", icon: MessageSquare, color: "bg-primary-soft text-primary" },
    { k: "med", label: "药物变动", desc: "联动护士 · 上报医师", icon: Pill, color: "bg-ai-soft text-ai" },
  ];
  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="text-xl font-bold mb-1">待办分类</h2>
      <p className="text-xs text-muted-foreground mb-4">按事项类型查看患者列表，逐位处理</p>
      <div className="space-y-2">
        {queues.map((q) => {
          const Icon = q.icon;
          const count = QUEUES[q.k].length;
          return (
            <button key={q.k} onClick={() => onOpenQueue(q.k)} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3 active:scale-[0.99]">
              <div className={`w-10 h-10 rounded-xl ${q.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold">{q.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{q.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">{count}</div>
                <div className="text-[10px] text-muted-foreground">待处理</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

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

const Me = ({ onOpenTeam }: { onOpenTeam: () => void }) => (
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
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-therapist" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-soft text-secondary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
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

const ConfirmAssessSheet = ({ patient }: { patient?: string }) => (
  <div className="p-4 space-y-3">
    <AICard title="医师推送的评估结果">
      患者：{patient || "王秀英 · 髋关节置换术后"}。Harris 65 分 / Berg 32 / VAS 6。
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
    <SectionTitle title="今日工作小结" />
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
