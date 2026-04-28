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
import {
  UsersRound,
  FileHeart,
  MessageCircle,
  User as UserIcon,
  Bell,
  ChevronRight,
  ClipboardList,
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
} from "lucide-react";
import { toast } from "sonner";

const THERAPIST_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: ClipboardList },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "plan", label: "康复方案", icon: FileHeart },
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
          onUploadDaily={() => open("uploadDaily")}
          onOpenSummary={() => open("summary")}
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
      {tab === "chat" && (
        <ChatHub
          subTab={chatSubTab}
          onChange={setChatSubTab}
          onOpenPatient={(p) => { setChatPatient(p); setSheet("patientChat"); }}
          onOpenMeeting={() => setSheet("meetingList")}
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
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已切换为手动调整"); }} className="flex-1 border border-secondary/30 text-secondary rounded-2xl py-3 text-sm font-semibold">手动修改</button>
          <button onClick={() => { toast.success("治疗目标已生成并回传医师"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">生成治疗目标</button>
        </div>}>
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

      <PhoneSheet open={sheet === "summary"} onClose={close} title={`今日工作小结${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("小结已提交，已同步医师端"); close(); }}>提交小结</PrimaryBtn>}>
        <SummarySheet />
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
  onUploadDaily,
  onOpenSummary,
  onOpenMed,
}: {
  onOpenQueue: (k: QueueKey) => void;
  onGoPatients: () => void;
  onUploadDaily: () => void;
  onOpenSummary: () => void;
  onOpenMed: () => void;
}) => {
  const execByType = [
    { type: "OT", count: QUEUES.exec.filter(e => e.meta?.startsWith("OT")).length || 1, color: "text-primary bg-primary-soft" },
    { type: "PT", count: QUEUES.exec.filter(e => e.meta?.startsWith("PT")).length || 1, color: "text-secondary bg-secondary-soft" },
    { type: "ST", count: QUEUES.exec.filter(e => e.meta?.startsWith("ST")).length || 1, color: "text-ai bg-ai-soft" },
  ];
  return (
    <div className="pb-4">
      <div className="gradient-therapist px-5 pt-6 pb-10 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">下午好</div>
            <div className="text-xl font-bold mt-0.5">王治疗师 👋</div>
            <div className="text-[11px] opacity-90 mt-1">PT/OT 治疗师 · 共 {PATIENTS.length} 位患者</div>
          </div>
          <button onClick={() => toast("您有 2 条新任务")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>
        <div className="relative mt-3">
          <PendingStatRow
            items={[
              { label: "待评估确认", count: QUEUES.confirmAssess.length, onClick: () => onOpenQueue("confirmAssess") },
              { label: "待确认目标", count: QUEUES.goal.length, onClick: () => onOpenQueue("goal") },
              { label: "待确认处方", count: QUEUES.rx.length, onClick: () => onOpenQueue("rx") },
              { label: "待执行任务", count: QUEUES.exec.length, onClick: () => onOpenQueue("exec") },
            ]}
          />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div>
          <SectionTitle title="待执行任务 · OT / PT / ST" extra={<button onClick={() => onOpenQueue("exec")} className="text-[11px] text-secondary font-semibold flex items-center">全部 <ChevronRight className="w-3 h-3" /></button>} />
          <div className="grid grid-cols-3 gap-2">
            {execByType.map(t => (
              <button key={t.type} onClick={() => onOpenQueue("exec")} className="bg-card rounded-2xl shadow-card p-3 text-left active:scale-[0.99]">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold ${t.color}`}>{t.type}</div>
                <div className="text-[18px] font-bold mt-2">{t.count}</div>
                <div className="text-[10px] text-muted-foreground">待执行</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="快速记录 · 写入患者档案" />
          <div className="grid grid-cols-3 gap-2">
            <button onClick={onOpenSummary} className="bg-card rounded-2xl shadow-card p-3 text-left active:scale-[0.99]">
              <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center"><ClipboardList className="w-4 h-4" /></div>
              <div className="text-[12px] font-semibold mt-2">每日小结</div>
            </button>
            <button onClick={onUploadDaily} className="bg-card rounded-2xl shadow-card p-3 text-left active:scale-[0.99]">
              <div className="w-9 h-9 rounded-xl bg-secondary-soft text-secondary flex items-center justify-center"><Activity className="w-4 h-4" /></div>
              <div className="text-[12px] font-semibold mt-2">治疗记录</div>
            </button>
            <button onClick={onOpenMed} className="bg-card rounded-2xl shadow-card p-3 text-left active:scale-[0.99]">
              <div className="w-9 h-9 rounded-xl bg-warning-soft text-warning flex items-center justify-center"><Pill className="w-4 h-4" /></div>
              <div className="text-[12px] font-semibold mt-2">药物变动</div>
            </button>
          </div>
        </div>

        <button onClick={onGoPatients} className="w-full bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3 active:scale-[0.99]">
          <div className="w-10 h-10 rounded-xl bg-secondary-soft text-secondary flex items-center justify-center"><UsersRound className="w-5 h-5" /></div>
          <div className="flex-1 text-left">
            <div className="text-[13px] font-semibold">进入患者管理</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">按状态 / 病症 / 入院时间筛选</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

/* ============== 患者管理（治疗师视角） ============== */
const TherapistPatients = ({
  onPickPatient,
  onOpenQueue,
  onUploadDaily,
}: {
  onPickPatient: (p: Patient) => void;
  onOpenQueue: (k: QueueKey) => void;
  onUploadDaily: () => void;
}) => {
  const tiles: { icon: any; label: string; color: string; k: QueueKey; count: number }[] = [
    { icon: ClipboardList, label: "评估确认", color: "text-secondary bg-secondary-soft", k: "confirmAssess", count: QUEUES.confirmAssess.length },
    { icon: Activity, label: "治疗目标", color: "text-primary bg-primary-soft", k: "goal", count: QUEUES.goal.length },
    { icon: Dumbbell, label: "处方确认", color: "text-success bg-success-soft", k: "rx", count: QUEUES.rx.length },
    { icon: Brain, label: "处方执行", color: "text-warning bg-warning-soft", k: "exec", count: QUEUES.exec.length },
  ];
  return (
    <div className="pb-4">
      <PatientsPage accent="therapist" onPick={onPickPatient} />
      <div className="px-4 space-y-3 mt-3">
        <SectionTitle title="治疗关注 · 快速入口" extra={<button onClick={onUploadDaily} className="text-[11px] text-secondary font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />上传每日治疗</button>} />
        <div className="grid grid-cols-4 gap-2">
          {tiles.map((it) => (
            <WorkbenchTile key={it.label} icon={it.icon} label={it.label} color={it.color} count={it.count} onClick={() => onOpenQueue(it.k)} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============== 沟通 Hub：患者沟通 + 团队会议 ============== */
const ChatHub = ({
  subTab,
  onChange,
  onOpenPatient,
  onOpenMeeting,
}: {
  subTab: "patient" | "team";
  onChange: (k: "patient" | "team") => void;
  onOpenPatient: (p: Patient) => void;
  onOpenMeeting: () => void;
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
              {k === "patient" ? `患者沟通 · ${PATIENT_UNREAD}` : `团队会议 · ${DEFAULT_MEETINGS.length}`}
            </button>
          );
        })}
      </div>
    </div>
    {subTab === "patient" ? (
      <PatientChatListSheet accent="therapist" onPick={onOpenPatient} />
    ) : (
      <div className="p-4 space-y-3">
        <button onClick={onOpenMeeting} className="w-full gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-card">
          <MessageSquare className="w-4 h-4" /> 进入团队会议（针对单个患者）
        </button>
        <AICard title="团队会议 · AI 自动纪要">所有会议均会由 AI 自动生成纪要并同步到患者档案。</AICard>
      </div>
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

const RxAdjustSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  return (
    <div className="p-4 space-y-3">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "张建国 · 男 56 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">脑卒中后偏瘫 · 入院第 12 天</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">处方确认</span>
        </div>
      </div>

      <AICard title="AI 生成的康复方案 + 处方建议">
        基于本周评估更新方案，PT 强度 +20%、新增 OT 厨房训练、ST 维持。下方为详细处方，可逐项调整后确认推送医师签发。
      </AICard>

      <SectionTitle title="排班联动（AI 自动）" extra={<button className="text-[10px] text-secondary font-semibold">手动调整</button>} />
      <div className="bg-card rounded-2xl shadow-card p-3 space-y-1.5 text-[11px]">
        <div className="flex justify-between"><span>09:00 PT · A-301</span><span className="text-muted-foreground">王治疗师</span></div>
        <div className="flex justify-between"><span>14:00 OT · B-201</span><span className="text-muted-foreground">陈治疗师</span></div>
        <div className="flex justify-between"><span>16:00 ST · B-205</span><span className="text-muted-foreground">陈思雨</span></div>
      </div>

      <SectionTitle title="处方明细（可调整）" />
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
};

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

const SummarySheet = () => (
  <div className="p-4 space-y-3">
    <SectionTitle title="今日工作小结" extra={<span className="text-[10px] text-muted-foreground">将自动写入患者档案</span>} />
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
