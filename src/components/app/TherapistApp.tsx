import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, PendingTodoGrid, TodoItem } from "@/components/app/TodoQueue";
import { RxDetail } from "@/components/app/RxDetail";
import {
  PatientsPage,
  PatientDetailSheet,
  AddNoteSheet,
  TeamManageSheet,
  PatientChatListSheet,
  PatientChatSheet,
  IMChatSheet,
  TeamMeetingListSheet,
  NewMeetingSheet,
  Patient,
  PatientFilter,
  PATIENTS,
  NEW_PATIENT_COUNT,
  PATIENT_UNREAD,
  DEFAULT_MEETINGS,
  DEFAULT_MEETING_MSGS,
  TeamMeeting,
} from "@/components/app/PatientsModule";
import { RehabPlanModule, PlanStage } from "@/components/app/RehabPlanModule";
import { MeStats } from "@/components/app/MeStats";
import {
  UsersRound,
  FileHeart,
  MessageCircle,
  User as UserIcon,
  Bell,
  ChevronRight,
  ClipboardList,
  ClipboardCheck,
  Activity,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Brain,
  MessageSquare,
  Pill,
  Edit3,
  Users,
  AlertTriangle,
  Sparkles,
  Plus,
  Stethoscope,
  Target,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const THERAPIST_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: ClipboardList },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "plan", label: "康复方案", icon: FileHeart },
  { key: "rx", label: "医嘱", icon: FileText },
  { key: "chat", label: "沟通", icon: MessageCircle, badge: PATIENT_UNREAD },
  { key: "me", label: "我的", icon: UserIcon },
];

type SheetKey =
  | null
  | "confirmAssess"
  | "goal"
  | "schedule"
  | "rx"
  | "exec"
  | "summary"
  | "med"
  | "patientDetail"
  | "addNote"
  | "team"
  | "patientChat"
  | "meetingList"
  | "newMeeting"
  | "meeting"
  | "uploadDaily";

type QueueKey = "confirmAssess" | "goal" | "rx" | "exec";

const QUEUE_TITLE: Record<QueueKey, string> = {
  confirmAssess: "待确认评估结果",
  goal: "待生成 / 调整治疗目标",
  rx: "待确认 AI 康复方案 / 处方",
  exec: "待执行康复处方",
};

const QUEUES: Record<QueueKey, TodoItem[]> = {
  confirmAssess: [
    { id: "ca1", patient: "王秀英 · 女 68", meta: "髋关节置换术后", detail: "AI 评估意见 + 待治疗师补充", urgency: "high" },
    { id: "ca2", patient: "周建华 · 男 72", meta: "脑梗死恢复期", detail: "FMA 38 · 待补充意见", urgency: "medium" },
  ],
  goal: [
    { id: "go1", patient: "李 强 · 男 42", meta: "脊髓损伤", detail: "医师已确认目标 · 待生成治疗目标", urgency: "high" },
    { id: "go2", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "医师已确认 · 待治疗师细化", urgency: "medium" },
  ],
  rx: [
    { id: "rx1", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "AI 康复方案 + 处方 · 待确认", urgency: "high" },
    { id: "rx2", patient: "王秀英 · 女 68", meta: "髋关节术后", detail: "新增站立平衡训练", urgency: "medium" },
  ],
  exec: [
    { id: "e1", patient: "李 强 · 男 42", meta: "OT · ADL 训练", detail: "厨房活动训练 25min · B-201", time: "14:00", urgency: "high" },
    { id: "e2", patient: "陈丽华 · 女 65", meta: "ST · 吞咽训练", detail: "B-205 · 30 min", time: "15:30", urgency: "medium" },
    { id: "e3", patient: "刘伟明 · 男 38", meta: "PT · 平衡训练", detail: "A-301 · 45 min", time: "16:30", urgency: "medium" },
  ],
};

export const TherapistApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [queue, setQueue] = useState<QueueKey | null>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const [pickedPatient, setPickedPatient] = useState<Patient | null>(null);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, Patient["notes"]>>({});
  const [planStage, setPlanStage] = useState<PlanStage>("goal");
  const [meetings, setMeetings] = useState<TeamMeeting[]>(DEFAULT_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<TeamMeeting | null>(null);
  const [chatSubTab, setChatSubTab] = useState<"patient" | "team">("patient");

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
  const pickPlanPatient = (stage: PlanStage, p: Patient) => {
    setActivePatient(`${p.name} · 床${p.bed}`);
    if (stage === "goal") setSheet("goal");
    else setSheet("rx");
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="therapist" newPatientCount={NEW_PATIENT_COUNT} items={THERAPIST_TABS} />}>
      {tab === "home" && (
        <TherapistHome
          onOpenQueue={openQueue}
          onGoPatients={() => setTab("patients")}
          onGoRx={() => setTab("rx")}
          onUploadDaily={() => open("uploadDaily")}
          onOpenMed={() => open("med")}
        />
      )}
      {tab === "patients" && (
        <TherapistPatients
          onPickPatient={pickPatient}
          onOpenQueue={openQueue}
          onUploadDaily={() => open("uploadDaily")}
        />
      )}
      {tab === "plan" && (
        <RehabPlanModule
          accent="therapist"
          initialStage={planStage}
          stages={["goal", "airx"]}
          onPickPlan={pickPlanPatient}
          title="康复方案"
          subtitle="治疗目标 + 康复处方确认"
        />
      )}
      {tab === "rx" && (
        <RxTab onPick={(item) => { setActivePatient(item.patient); setSheet("rx"); }} />
      )}
      {tab === "chat" && (
        <ChatHub
          subTab={chatSubTab}
          onChange={setChatSubTab}
          onOpenPatient={(p) => { setChatPatient(p); setSheet("patientChat"); }}
          meetings={meetings}
          onPickMeeting={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreateMeeting={() => setSheet("newMeeting")}
        />
      )}
      {tab === "me" && <Me onOpenTeam={() => open("team")} />}

      {(["confirmAssess", "goal", "rx", "exec"] as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="therapist">
          <TodoQueueList
            accent="therapist"
            items={QUEUES[k]}
            onPick={(item) => pickFromQueue(item, k === "confirmAssess" ? "confirmAssess" : k === "goal" ? "goal" : k === "rx" ? "rx" : "exec")}
          />
        </PhoneSheet>
      ))}

      <PhoneSheet open={sheet === "confirmAssess"} onClose={close} title={`评估结果确认${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已请医师再次评估"); close(); }} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">结果不确定</button>
          <button onClick={() => { toast.success("评估已确认 · 进入目标生成"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认结果</button>
        </div>}>
        <ConfirmAssessSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title={`治疗目标${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={
          <button onClick={() => { toast.success("治疗目标已生成并回传医师"); close(); }} className="w-full gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">生成治疗目标</button>
        }>
        <GoalAdjustSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "rx"} onClose={close} title={`AI 康复方案 / 处方${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => open("schedule")} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">调整排班</button>
          <button onClick={() => { toast.success("已确认并推送至康复医师签发"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认 · 推送医师</button>
        </div>}>
        <RxAdjustSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "schedule"} onClose={close} title="智能排班 · 手动调整" accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("排班已保存"); close(); }}>保存排班</PrimaryBtn>}>
        <ScheduleSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "exec"} onClose={close} title={`处方执行${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { open("summary"); }}>完成 · 写工作小结</PrimaryBtn>}>
        <ExecSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "summary"} onClose={close} title={`每日小结${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("小结已写入该患者档案"); close(); }}>提交小结</PrimaryBtn>}>
        <SummarySheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "uploadDaily"} onClose={close} title="上传每日治疗情况" accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("每日治疗情况已上传至患者档案"); close(); }}>上传到患者档案</PrimaryBtn>}>
        <UploadDailySheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "med"} onClose={close} title={`药物变动记录${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("药物变动已记录"); close(); }}>保存记录</PrimaryBtn>}>
        <MedSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientDetail"} onClose={close} title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`} accent="therapist">
        <PatientDetailSheet
          patient={pickedPatient}
          accent="therapist"
          onAddNote={() => setSheet("addNote")}
          actions={[
            { key: "summary", label: "每日小结", icon: ClipboardList, onClick: () => { setActivePatient(pickedPatient ? `${pickedPatient.name} · 床${pickedPatient.bed}` : ""); setSheet("summary"); } },
            { key: "therapy", label: "治疗记录", icon: Activity, onClick: () => setSheet("uploadDaily") },
            { key: "med", label: "药物变动", icon: Pill, onClick: () => { setActivePatient(pickedPatient ? `${pickedPatient.name} · 床${pickedPatient.bed}` : ""); setSheet("med"); } },
            { key: "note", label: "备注", icon: Edit3, onClick: () => setSheet("addNote") },
          ]}
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

      <PhoneSheet open={sheet === "patientChat"} onClose={close} title="患者沟通" accent="therapist" flush hideHeader>
        <PatientChatSheet accent="therapist" patient={chatPatient} onClose={close} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "meetingList"} onClose={close} title="团队会议" accent="therapist">
        <TeamMeetingListSheet
          accent="therapist"
          meetings={meetings}
          onPick={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreate={() => setSheet("newMeeting")}
        />
      </PhoneSheet>
      <PhoneSheet open={sheet === "newMeeting"} onClose={() => setSheet("meetingList")} title="新增团队会议" accent="therapist">
        <NewMeetingSheet accent="therapist" onCreate={(m) => { setMeetings([m, ...meetings]); setActiveMeeting(m); toast.success("会议已创建"); setSheet("meeting"); }} />
      </PhoneSheet>
      <PhoneSheet open={sheet === "meeting"} onClose={() => setSheet("meetingList")} title="团队会议" accent="therapist" flush hideHeader>
        <IMChatSheet
          accent="therapist"
          title={`团队会议 · ${activeMeeting?.patientName ?? "张建国"}`}
          subtitle={activeMeeting?.topic ?? "V2 方案确认"}
          participants={activeMeeting?.participants ?? ["李医师", "王治疗师", "陈治疗师", "赵护士"]}
          initialMessages={DEFAULT_MEETING_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          onClose={() => setSheet("meetingList")}
        />
      </PhoneSheet>
    </ScreenShell>
  );
};

/* ============== 治疗师首页 ============== */
const TherapistHome = ({
  onOpenQueue,
  onGoPatients,
  onGoRx,
  onUploadDaily,
  onOpenMed,
}: {
  onOpenQueue: (k: QueueKey) => void;
  onGoPatients: () => void;
  onGoRx: () => void;
  onUploadDaily: () => void;
  onOpenMed: () => void;
}) => {
  const allTodos: { patient: string; meta: string; time?: string; urgency: "high" | "medium" | "low"; k: QueueKey }[] = [
    ...QUEUES.confirmAssess.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "confirmAssess" as QueueKey })),
    ...QUEUES.goal.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "goal" as QueueKey })),
    ...QUEUES.rx.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "rx" as QueueKey })),
    ...QUEUES.exec.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "exec" as QueueKey })),
  ].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.urgency] - { high: 0, medium: 1, low: 2 }[b.urgency]));
  const tagShort: Record<QueueKey, string> = { confirmAssess: "评估", goal: "目标", rx: "医嘱", exec: "执行" };
  return (
    <div className="pb-4">
      <div className="bg-background px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">下午好</div>
            <div className="text-xl font-bold mt-0.5 text-foreground">王治疗师 👋</div>
            <div className="text-[11px] text-muted-foreground mt-1">PT/OT 治疗师 · 共 {PATIENTS.length} 位患者</div>
          </div>
          <button onClick={() => toast("您有 2 条新任务")} className="w-9 h-9 rounded-full bg-secondary-soft text-secondary flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">今日待处理</span>
        </div>
        <PendingTodoGrid
          items={[
            { label: "待评估确认", count: QUEUES.confirmAssess.length, icon: ClipboardCheck, iconClass: "bg-warning text-white", onClick: () => onOpenQueue("confirmAssess") },
            { label: "待确认目标", count: QUEUES.goal.length, icon: Target, iconClass: "bg-primary text-white", onClick: () => onOpenQueue("goal") },
            { label: "待确认医嘱", count: QUEUES.rx.length, icon: FileText, iconClass: "bg-secondary text-white", onClick: onGoRx },
          ]}
        />
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">今日待办清单</span>
          <span className="text-[11px] text-muted-foreground">共 {allTodos.length} 项 · 按优先级</span>
        </div>
        <div className="bg-card rounded-2xl shadow-card border border-border/40 divide-y divide-border/60 overflow-hidden">
          {allTodos.map((t, idx) => {
            const tagColor =
              t.k === "confirmAssess" ? "bg-warning/15 text-warning" :
              t.k === "goal" ? "bg-primary/10 text-primary" :
              t.k === "rx" ? "bg-secondary/10 text-secondary" :
              "bg-success/10 text-success";
            const uColor =
              t.urgency === "high" ? "bg-destructive/10 text-destructive" :
              t.urgency === "medium" ? "bg-warning/15 text-warning" :
              "bg-muted text-muted-foreground";
            const uLabel = t.urgency === "high" ? "紧急" : t.urgency === "medium" ? "重要" : "常规";
            return (
              <button
                key={`${t.k}-${idx}`}
                onClick={() => onOpenQueue(t.k)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2 active:bg-muted/40"
              >
                <div className="w-7 h-7 rounded-lg bg-muted text-foreground/70 flex items-center justify-center text-[11px] font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${tagColor}`}>{tagShort[t.k]}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${uColor}`}>{uLabel}</span>
                    <span className="text-[12px] font-semibold truncate">{t.patient}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {t.meta}{t.time ? ` · ${t.time}` : ""}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

/* ============== 患者管理（治疗师视角） ============== */
const TherapistPatients = ({
  onPickPatient,
  onOpenQueue,
}: {
  onPickPatient: (p: Patient) => void;
  onOpenQueue?: (k: QueueKey) => void;
  onUploadDaily?: () => void;
}) => {
  // 基于康复方案生成的治疗师待办任务
  const planTodos = [
    { patient: "张建国", task: "完成 PT 下肢力量 3×10", from: "康复方案 V2", k: "exec" as QueueKey },
    { patient: "李 强", task: "OT 厨房活动 25min · 评估反馈", from: "康复目标 · 本周", k: "exec" as QueueKey },
    { patient: "陈丽华", task: "ST 吞咽训练 30min · 记录改善", from: "康复处方 · 新增", k: "exec" as QueueKey },
  ];
  return (
    <div className="pb-4">
      <div className="px-4 pt-3 space-y-2">
        <AICard title="每日小结 · 按患者填写">
          请进入对应患者档案，点击「每日小结」按钮填写当日治疗记录、药物变动等信息。
        </AICard>

        <div className="bg-card rounded-2xl shadow-card border border-border/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" /> 基于康复方案的待办任务
            </span>
            <span className="text-[10px] text-muted-foreground">共 {planTodos.length} 项</span>
          </div>
          <div className="divide-y divide-border/60">
            {planTodos.map((t, i) => (
              <button
                key={i}
                onClick={() => onOpenQueue?.(t.k)}
                className="w-full text-left py-2 flex items-center gap-2 active:bg-muted/40"
              >
                <div className="w-6 h-6 rounded-md bg-secondary-soft text-secondary flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate">{t.patient} · {t.task}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">来源：{t.from}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <PatientsPage accent="therapist" onPick={onPickPatient} />
    </div>
  );
};

/* ============== 沟通 Hub：患者沟通 + 团队会议 ============== */
const ChatHub = ({
  subTab,
  onChange,
  onOpenPatient,
  meetings,
  onPickMeeting,
  onCreateMeeting,
}: {
  subTab: "patient" | "team";
  onChange: (k: "patient" | "team") => void;
  onOpenPatient: (p: Patient) => void;
  meetings: TeamMeeting[];
  onPickMeeting: (m: TeamMeeting) => void;
  onCreateMeeting: () => void;
}) => (
  <div className="pb-4">
    <div className="gradient-therapist px-5 pt-6 pb-6 text-white">
      <div className="text-xs opacity-80">沟通中心</div>
      <div className="text-[15px] font-semibold mt-0.5">患者沟通 + 团队会议</div>
      <div className="mt-3 flex gap-1.5 bg-white/15 backdrop-blur rounded-full p-1">
        {(["patient", "team"] as const).map((k) => {
          const active = subTab === k;
          return (
            <button
              key={k}
              onClick={() => onChange(k)}
              className={`flex-1 text-[12px] py-1.5 rounded-full font-semibold transition-all ${active ? "bg-white text-foreground" : "text-white/90"}`}
            >
              {k === "patient" ? `患者沟通 · ${PATIENT_UNREAD}` : `团队会议 · ${meetings.length}`}
            </button>
          );
        })}
      </div>
    </div>
    {subTab === "patient" ? (
      <PatientChatListSheet accent="therapist" onPick={onOpenPatient} />
    ) : (
      <TeamMeetingListSheet
        accent="therapist"
        meetings={meetings}
        onPick={onPickMeeting}
        onCreate={onCreateMeeting}
      />
    )}
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

    <MeStats
      accent="therapist"
      tiles={[
        { label: "本月治疗", value: 248, sub: "次" },
        { label: "患者好评", value: "98%", sub: "满意度" },
        { label: "平均时长", value: "42m", sub: "/次" },
      ]}
      trend={[
        { day: "一", value: 9 }, { day: "二", value: 12 }, { day: "三", value: 11 },
        { day: "四", value: 14 }, { day: "五", value: 13 }, { day: "六", value: 5 }, { day: "日", value: 3 },
      ]}
    />

    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-therapist" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-soft text-secondary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      {[
        { label: "我的患者", info: `当前共 ${PATIENTS.length} 位患者，本周新增 2 位` },
        { label: "治疗记录", info: "本月共 248 次治疗记录已自动归档至患者档案" },
        { label: "排班管理", info: "本周排班 32 项 · AI 已优化训练室占用率" },
        { label: "知识库", info: "已收藏 18 篇 PT/OT 实训手册，可在患者档案中调阅" },
        { label: "设置", info: "默认手势：双指上滑发起团队会议；震动提醒：开" },
      ].map((it) => (
        <button key={it.label} onClick={() => toast.success(it.info)} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it.label}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===================== Sheets ===================== */

const ConfirmAssessSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ")[0] : "王秀英";
  return (
    <div className="p-4 space-y-3">
      {/* 患者档案概要 - 与医师端一致 */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "王秀英 · 女 68 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">床号 305 · 入院第 5 天 · 髋关节置换术后</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">评估确认</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatChip label="Harris" value="65" accent="primary" />
          <StatChip label="Berg" value="32" accent="warning" />
          <StatChip label="VAS" value="6" accent="warning" />
        </div>
      </div>

      <SectionTitle title="档案信息（医师同步）" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="主诉" value="右髋疼痛伴活动受限 3 个月" />
        <FormRow label="既往史" value="高血压 8 年 · 糖尿病 5 年" />
        <FormRow label="手术史" value="2026-04-23 右髋关节置换术" />
        <FormRow label="并发症风险" value="DVT 中 · 跌倒高" />
      </div>

      <AICard title="AI 康复评估意见（医师推送）">
        Harris 65 / Berg 32 / VAS 6。综合判定：术后早期，疼痛是主要限制因素；康复潜力良好。
        建议进入「目标设定 → 方案制定」，重点：疼痛干预 + 渐进负重 + 平衡训练。
      </AICard>

      <SectionTitle title="治疗师补充意见（必填）" extra={<span className="text-[10px] text-muted-foreground">将与 AI 意见一同呈现给医师</span>} />
      <div className="bg-card rounded-2xl shadow-card p-3">
        <textarea
          defaultValue="实际触诊：右髋屈曲 60°、外展 25°，主动活动时 VAS 7；床椅转移需中等辅助。建议先 1 周疼痛干预 + 等长收缩，再渐进负重。"
          placeholder="补充观察、ROM 实测、患者主诉……"
          className="w-full bg-muted rounded-xl p-3 text-xs h-28 outline-none"
        />
      </div>

      <SectionTitle title="逐项确认" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="Harris 髋关节" value="65 ✓" />
        <FormRow label="Berg 平衡" value="32 ✓" />
        <FormRow label="VAS 疼痛" value="6 ⚠️" hint="较高，建议先疼痛干预" />
        <FormRow label="ROM 屈曲（实测）" value="60° / 100°" />
      </div>
    </div>
  );
};

const GoalAdjustSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ")[0] : "李 强";
  return (
    <div className="p-4 space-y-3">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "李 强 · 男 42 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">脊髓损伤 · 入院第 28 天</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">治疗目标</span>
        </div>
      </div>

      <AICard title="医师已确认康复目标 · 治疗师细化生成">
        医师设定整体目标：ADL Barthel ≥ 85，独立步行 50m。请在此基础上拆解为可执行的治疗目标并可手动调整。
      </AICard>

      <SectionTitle title="治疗目标（可调整）" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="ADL Barthel" value={<input defaultValue="70" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="医师目标 85 · 本周分阶段 70" />
        <FormRow label="步行距离 (m)" value={<input defaultValue="20" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="本周阶段目标" />
        <FormRow label="FMA 提升" value={<input defaultValue="4" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="分 · 本周" />
        <FormRow label="目标周期" value={<input defaultValue="1" className="w-14 text-right bg-muted rounded px-2 py-1 text-xs" />} hint="周" />
      </div>

      <button className="w-full flex items-center justify-center gap-1 text-xs text-secondary font-semibold py-2" onClick={() => toast("已新增自定义目标项")}>
        <Plus className="w-3.5 h-3.5" /> 新增治疗目标项
      </button>
    </div>
  );
};

const ScheduleSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="资源平台 AI 自动排班">已根据治疗师空闲时段、训练室占用、患者偏好生成排班，可手动调整。</AICard>
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
  </div>
);

const RxAdjustSheet = ({ patient }: { patient?: string }) => (
  <RxDetail patient={patient} accent="therapist" />
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
        <FormRow key={a} label={`${i + 1}. ${a}`} value={i < 2 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <span className="text-[11px] text-muted-foreground">待完成</span>} />
      ))}
    </div>
    <AICard title="实时反馈">患者本次任务负重耐受良好，建议下次增加 5min。</AICard>
  </div>
);

const SummarySheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  return (
    <div className="p-4 space-y-3">
      {/* 患者信息卡 */}
      <div className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">
          {name[0]}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">{patient || "张建国 · 床A-301"}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">本日小结 · 2026-05-06</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">每日小结</span>
      </div>

      <SectionTitle title="本患者今日治疗" extra={<span className="text-[10px] text-muted-foreground">将归入该患者档案</span>} />
      <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">完成训练项</div>
          <div className="text-sm font-semibold">PT 下肢力量 · OT 厨房活动 · 共 2 项 / 55 分钟</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">患者主观感受 (Borg)</div>
          <div className="flex gap-1">
            {[6, 7, 8, 9, 10, 11, 12].map((n) => (
              <button key={n} className={`flex-1 py-2 rounded-lg text-xs ${n === 9 ? "gradient-therapist text-white" : "bg-muted"}`}>{n}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">治疗记录</div>
          <textarea defaultValue={`${name} 今日完成 PT/OT 训练，厨房活动表现明显改善，建议明日加入精细动作训练。`} className="w-full bg-muted rounded-xl p-3 text-xs h-24 outline-none" />
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">药物变动 / 反馈</div>
          <textarea placeholder="如：巴氯芬调整为 10mg bid，肌张力下降..." className="w-full bg-muted rounded-xl p-3 text-xs h-16 outline-none" />
        </div>
      </div>
    </div>
  );
};

/* ============== 医嘱 Tab ============== */
const RxTab = ({ onPick }: { onPick: (item: TodoItem) => void }) => (
  <div className="pb-4">
    <div className="gradient-therapist px-5 pt-6 pb-6 text-white relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="text-xs opacity-80">康复医嘱</div>
        <div className="text-[15px] font-semibold mt-0.5">待确认 · {QUEUES.rx.length} 项</div>
        <div className="text-[11px] opacity-80 mt-1">康复整体计划 · 全套训练 + 流程安排，含居家训练</div>
      </div>
    </div>
    <div className="px-4 pt-4">
      <TodoQueueList accent="therapist" items={QUEUES.rx} onPick={onPick} />
    </div>
  </div>
);

const UploadDailySheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="手动上传每日治疗情况">支持工作小结、药物变动、训练记录等，提交后自动归入对应患者档案。</AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value={<select className="bg-muted rounded px-2 py-1 text-xs">{PATIENTS.map(p => <option key={p.id}>{p.name} · 床{p.bed}</option>)}</select>} />
      <FormRow label="治疗类型" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>PT</option><option>OT</option><option>ST</option></select>} />
      <FormRow label="记录类型" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>工作小结</option><option>药物变动</option><option>训练记录</option></select>} />
    </div>
    <textarea placeholder="详细描述..." className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-32 outline-none" defaultValue="患者今日完成 PT 步态训练 30min，步频提高 8%，无不良反应。" />
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
