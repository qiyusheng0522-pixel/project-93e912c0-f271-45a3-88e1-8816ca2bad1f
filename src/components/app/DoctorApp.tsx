import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, PendingTodoGrid, TodoItem } from "@/components/app/TodoQueue";
import {
  PatientsPage,
  PatientDetailSheet,
  PatientActionsBar,
  AddNoteSheet,
  TeamManageSheet,
  IMChatSheet,
  TeamMeetingListSheet,
  NewMeetingSheet,
  PatientChatListSheet,
  PatientChatSheet,
  Patient,
  PatientFilter,
  PatientPendingKey,
  getPatientStage,
  PATIENTS,
  NEW_PATIENT_COUNT,
  FIRST_ASSESS_COUNT,
  RETURNED_REASSESS_COUNT,
  PATIENT_UNREAD,
  DEFAULT_MEETING_MSGS,
  DEFAULT_VIDEO_MSGS,
  DEFAULT_MEETINGS,
  TeamMeeting,
} from "@/components/app/PatientsModule";
import { RehabPlanModule, PlanStage } from "@/components/app/RehabPlanModule";
import { RxDetail } from "@/components/app/RxDetail";
import { MeStats } from "@/components/app/MeStats";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  ChevronRight,
  ClipboardCheck,
  Target,
  FileText,
  Users,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Calendar,
  Video,
  Plus,
  Edit3,
  Home as HomeIcon,
  UsersRound,
  FileHeart,
  AlertTriangle,
  User as UserIcon,
  LogOut,
  MessageCircle,
} from "lucide-react";

type SheetKey =
  | null
  | "assess"
  | "goal"
  | "plan"
  | "meetingList"
  | "newMeeting"
  | "meeting"
  | "rx"
  | "discharge"
  | "videoPicker"
  | "video"
  | "patientDetail"
  | "addNote"
  | "team"
  | "patientChatList"
  | "patientChat";

const DOCTOR_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: HomeIcon },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "plan", label: "康复方案", icon: FileHeart },
  { key: "rx", label: "医嘱", icon: Sparkles },
  { key: "chat", label: "沟通", icon: MessageCircle, badge: PATIENT_UNREAD },
  { key: "me", label: "我的", icon: UserIcon },
];

export const DoctorApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const [pickedPatient, setPickedPatient] = useState<Patient | null>(null);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, Patient["notes"]>>({});
  const [patientsFilter, setPatientsFilter] = useState<PatientFilter>("all");
  const [planStage, setPlanStage] = useState<PlanStage>("plan");
  const [meetings, setMeetings] = useState<TeamMeeting[]>(DEFAULT_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<TeamMeeting | null>(null);
  const [therapistPickerOpen, setTherapistPickerOpen] = useState(false);
  const [videoPatient, setVideoPatient] = useState<Patient | null>(null);
  const [chatSubTab, setChatSubTab] = useState<"patient" | "team">("patient");

  const open = (k: SheetKey) => setSheet(k);
  const close = () => setSheet(null);

  const goPatients = (filter: PatientFilter = "all") => {
    setPatientsFilter(filter);
    setTab("patients");
  };
  const goPlan = (stage: PlanStage) => {
    setPlanStage(stage);
    setTab("plan");
  };
  const goRx = () => setTab("rx");
  const pickPatient = (p: Patient) => {
    const merged = { ...p, notes: patientNotes[p.id] ?? p.notes };
    setPickedPatient(merged);
    setSheet("patientDetail");
  };
  const pickPlanPatient = (stage: PlanStage, p: Patient) => {
    setActivePatient(`${p.name} · 床${p.bed}`);
    if (stage === "goal") setSheet("goal");
    else if (stage === "plan") setSheet("plan");
    else if (stage === "airx") setSheet("rx");
    else setSheet("discharge");
  };
  const pickDischargePatient = (_s: PlanStage, p: Patient) => {
    setActivePatient(`${p.name} · 床${p.bed}`);
    setSheet("discharge");
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="doctor" newPatientCount={NEW_PATIENT_COUNT} items={DOCTOR_TABS} />}>
      {tab === "home" && (
        <DoctorHome
          onOpen={open}
          onGoPatients={goPatients}
          onGoPlan={goPlan}
          onGoRx={goRx}
          onGoDischarge={() => setTab("discharge")}
          onGoChat={() => setTab("chat")}
        />
      )}
      {tab === "patients" && (
        <PatientsPage
          accent="doctor"
          onPick={pickPatient}
          initialFilter={patientsFilter}
          onAction={(key, p) => {
            setActivePatient(`${p.name} · 床${p.bed}`);
            setPickedPatient({ ...p, notes: patientNotes[p.id] ?? p.notes });
            if (key === "assess") setSheet("assess");
            else if (key === "plan") setSheet("plan");
            else setSheet("rx");
          }}
        />
      )}
      {tab === "plan" && (
        <RehabPlanModule
          accent="doctor"
          onPickPlan={pickPlanPatient}
          initialStage={planStage}
          stages={["goal", "plan"]}
          title="康复方案"
          subtitle="院内康复治疗方案 · 目标 / 方案"
        />
      )}
      {tab === "rx" && (
        <RehabPlanModule
          accent="doctor"
          onPickPlan={pickPlanPatient}
          initialStage="airx"
          stages={["airx"]}
          title="康复医嘱"
          subtitle="康复整体计划 · 全套训练 + 流程安排 · 含居家训练"
        />
      )}
      {tab === "discharge" && (
        <RehabPlanModule
          accent="doctor"
          onPickPlan={pickDischargePatient}
          initialStage="discharge"
          stages={["discharge"]}
          title="出院方案"
          subtitle="AI 二级方案 · 需医师二次确认"
        />
      )}
      {tab === "chat" && (
        <DoctorChatHub
          subTab={chatSubTab}
          onChange={setChatSubTab}
          onOpenPatient={(p) => { setChatPatient(p); setSheet("patientChat"); }}
          meetings={meetings}
          onPickMeeting={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreateMeeting={() => setSheet("newMeeting")}
        />
      )}
      {tab === "me" && <DoctorMe onOpenTeam={() => open("team")} />}

      <PhoneSheet open={sheet === "assess"} onClose={close} title={`首次康复评估${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveMeeting(null); setSheet("meeting"); toast("已发起团队会议评估"); }}
              className="flex-1 border border-primary/30 text-primary rounded-2xl py-3 text-sm font-semibold"
            >
              团队会议评估
            </button>
            <button
              onClick={() => {
                toast.success("评估结果已确认 · 请指派治疗师");
                setTherapistPickerOpen(true);
              }}
              className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold"
            >
              确认首次评估
            </button>
          </div>
        }>
        <AssessSheet patient={activePatient} onLaunchMeeting={() => { setActiveMeeting(null); setSheet("meeting"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title={`AI 康复目标${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <button onClick={() => { toast.success("康复目标已同步治疗师"); close(); }} className="w-full gradient-ai text-white rounded-2xl py-3 text-sm font-semibold">同步治疗师</button>
        }>
        <GoalSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "plan"} onClose={close} title={`AI 康复方案${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setActiveMeeting(null); setSheet("meeting"); }} className="flex-1 border border-ai/30 text-ai rounded-2xl py-3 text-sm font-semibold">提交团队会议</button>
            <button onClick={() => { toast.success("康复方案已直接确认 · 推送治疗师"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">直接确认</button>
          </div>
        }>
        <PlanSheet patient={activePatient} onLaunchMeeting={() => { setActiveMeeting(null); setSheet("meeting"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "meetingList"} onClose={close} title="团队会议" accent="doctor">
        <TeamMeetingListSheet
          accent="doctor"
          meetings={meetings}
          onPick={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreate={() => setSheet("newMeeting")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "newMeeting"} onClose={() => setSheet("meetingList")} title="新增团队会议" accent="doctor">
        <NewMeetingSheet
          accent="doctor"
          onCreate={(m) => {
            setMeetings([m, ...meetings]);
            setActiveMeeting(m);
            toast.success("会议已创建");
            setSheet("meeting");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "meeting"} onClose={() => setSheet(activeMeeting ? "meetingList" : null)} title="团队会议" accent="doctor" flush hideHeader>
        <IMChatSheet
          accent="doctor"
          title={`团队会议 · ${activeMeeting?.patientName ?? (activePatient ? activePatient.split(" ")[0] : "张建国")}`}
          subtitle={activeMeeting?.topic ?? "V2 方案确认"}
          participants={activeMeeting?.participants ?? ["李医师", "王治疗师", "陈治疗师", "赵护士", "孙博士"]}
          initialMessages={DEFAULT_MEETING_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          enablePlanConfirm
          onClose={() => setSheet(activeMeeting ? "meetingList" : null)}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "rx"} onClose={close} title={`确认康复医嘱${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setTherapistPickerOpen(true)} className="flex-1 border border-primary/30 text-primary rounded-2xl py-3 text-sm font-semibold">调整治疗师</button>
            <button onClick={() => toast("已驳回，待 AI 重新生成")} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">驳回</button>
            <button onClick={() => { toast.success("处方已确认 · 推送治疗师"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">确认 · 推送</button>
          </div>
        }>
        <RxSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "discharge"} onClose={close} title={`出院二级方案${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <div className="flex gap-2">
            <button onClick={() => toast("已请 AI 重新生成")} className="flex-1 border border-ai/30 text-ai rounded-2xl py-3 text-sm font-semibold">AI 重新生成</button>
            <button onClick={() => { toast.success("AI 出院方案二次确认通过 · 转社区"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">二次确认 · 转社区</button>
          </div>
        }>
        <DischargeSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "videoPicker"} onClose={close} title="线上会诊 · 选择患者" accent="doctor">
        <VideoPatientPicker
          onPick={(p) => {
            setVideoPatient(p);
            setSheet("video");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "video"} onClose={() => setSheet("videoPicker")} title="线上会诊" accent="doctor" flush hideHeader>
        <IMChatSheet
          accent="doctor"
          title={`线上会诊 · ${videoPatient?.name ?? "王秀英"}`}
          subtitle={`${videoPatient?.condition ?? "髋关节术后会诊"} · 床${videoPatient?.bed ?? "305"}`}
          participants={
            videoPatient?.shared && videoPatient.shared.length > 0
              ? ["李医师", ...videoPatient.shared]
              : ["李医师", "王治疗师", "赵护士"]
          }
          initialMessages={DEFAULT_VIDEO_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          onClose={() => setSheet("videoPicker")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChatList"} onClose={close} title="患者沟通" accent="doctor">
        <PatientChatListSheet accent="doctor" onPick={(p) => { setChatPatient(p); setSheet("patientChat"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChat"} onClose={() => setSheet("patientChatList")} title="患者沟通" accent="doctor" flush hideHeader>
        <PatientChatSheet accent="doctor" patient={chatPatient} onClose={() => setSheet("patientChatList")} />
      </PhoneSheet>

      <PhoneSheet
        open={sheet === "patientDetail"}
        onClose={close}
        title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`}
        accent="doctor"
        footer={
          pickedPatient
            ? (() => {
                const stage = getPatientStage(pickedPatient);
                const noteAct = { key: "note", label: "备注", icon: Edit3, onClick: () => setSheet("addNote") };
                let acts: any[] = [];
                if (stage === "院前") {
                  if (!pickedPatient.needFirstAssess) acts.push({ key: "assess", label: "查看评估", icon: ClipboardCheck, onClick: () => setSheet("assess") });
                  if (!pickedPatient.needPlanConfirm) acts.push({ key: "plan", label: "查看方案", icon: FileText, onClick: () => setSheet("plan") });
                  if (!pickedPatient.needRxConfirm) acts.push({ key: "rx", label: "查看医嘱", icon: Sparkles, onClick: () => setSheet("rx") });
                } else if (stage === "待出院") {
                  // 待出院：仅查看详情 + 备注，无其他操作
                  acts = [];
                } else if (stage === "院中") {
                  acts = [
                    { key: "assess", label: "查看评估", icon: ClipboardCheck, onClick: () => setSheet("assess") },
                    { key: "plan", label: "查看方案", icon: FileText, onClick: () => setSheet("plan") },
                    { key: "rx", label: "查看医嘱", icon: Sparkles, onClick: () => setSheet("rx") },
                  ];
                }
                acts.push(noteAct);
                return <PatientActionsBar accent="doctor" actions={acts} />;
              })()
            : undefined
        }
      >
        <PatientDetailSheet
          patient={pickedPatient}
          accent="doctor"
          onAddNote={() => setSheet("addNote")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "addNote"} onClose={() => setSheet("patientDetail")} title="添加患者备注" accent="doctor">
        <AddNoteSheet
          patient={pickedPatient}
          accent="doctor"
          onSave={(text) => {
            if (!pickedPatient) return;
            const newNote = { author: "李医师", time: "刚刚", text };
            const updated = [newNote, ...(patientNotes[pickedPatient.id] ?? pickedPatient.notes)];
            setPatientNotes({ ...patientNotes, [pickedPatient.id]: updated });
            setPickedPatient({ ...pickedPatient, notes: updated });
            toast.success("备注已保存并共享给团队");
            setSheet("patientDetail");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "team"} onClose={close} title="团队管理" accent="doctor">
        <TeamManageSheet accent="doctor" />
      </PhoneSheet>

      <TherapistPickerDialog
        open={therapistPickerOpen}
        onClose={() => setTherapistPickerOpen(false)}
        onConfirm={(types, name) => {
          setTherapistPickerOpen(false);
          toast.success(`已指定 ${types.join("/")} 治疗师 · ${name}`);
          close();
        }}
      />
    </ScreenShell>
  );
};

/* ===== 线上会诊 · 患者选择 ===== */
const VideoPatientPicker = ({ onPick }: { onPick: (p: Patient) => void }) => (
  <div className="p-4 space-y-3">
    <AICard title="发起线上会诊 · 先选择患者">
      不同患者关联的协作角色不同，请先选择患者，系统会自动拉取该患者的医师 / 治疗师 / 护理 / 心理团队进入会诊。
    </AICard>
    <SectionTitle title={`患者列表 · ${PATIENTS.length}`} />
    <div className="space-y-2">
      {PATIENTS.map((p) => (
        <button
          key={p.id}
          onClick={() => onPick(p)}
          className="w-full bg-card rounded-2xl shadow-card p-3.5 text-left active:scale-[0.99] transition-transform flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold">{p.name[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold flex items-center gap-1.5">
              {p.name}
              <span className="text-[10px] text-muted-foreground font-normal">床{p.bed}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary">{p.status}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.condition} · {p.meta}</div>
            <div className="text-[10px] text-muted-foreground mt-1 truncate">协作：{p.shared.join(" / ") || "暂无"}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===== 指定治疗师弹窗 ===== */
const THERAPIST_OPTIONS: Record<"PT" | "OT" | "ST", string[]> = {
  PT: ["王雅琴", "李建华"],
  OT: ["陈治疗师", "周敏"],
  ST: ["陈思雨", "刘语欣"],
};

const TherapistPickerDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (types: ("PT" | "OT" | "ST")[], name: string) => void;
}) => {
  const [types, setTypes] = useState<("PT" | "OT" | "ST")[]>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const toggle = (t: "PT" | "OT" | "ST") =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>指派治疗师</AlertDialogTitle>
          <AlertDialogDescription>评估已确认。请选择治疗类型（PT / OT / ST），并为每种类型指派治疗师。</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["PT", "OT", "ST"] as const).map((t) => (
              <button
                key={t}
                onClick={() => toggle(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                  types.includes(t) ? "gradient-doctor text-white border-transparent" : "border-border text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {types.map((t) => (
            <div key={t} className="bg-muted rounded-xl p-3">
              <div className="text-[11px] text-muted-foreground mb-2">{t} 治疗师</div>
              <div className="flex flex-wrap gap-2">
                {THERAPIST_OPTIONS[t].map((name) => (
                  <button
                    key={name}
                    onClick={() => setPicked({ ...picked, [t]: name })}
                    className={`text-[12px] px-3 py-1.5 rounded-lg border ${
                      picked[t] === name ? "bg-primary text-primary-foreground border-transparent" : "border-border bg-card"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (types.length === 0) return;
              const names = types.map((t) => picked[t] ?? THERAPIST_OPTIONS[t][0]).join(" / ");
              onConfirm(types, names);
              setTypes([]);
              setPicked({});
            }}
          >
            确认指派
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const DoctorChatHub = ({
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
    <div className="gradient-doctor px-5 pt-6 pb-6 text-white">
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
      <PatientChatListSheet accent="doctor" onPick={onOpenPatient} />
    ) : (
      <TeamMeetingListSheet
        accent="doctor"
        meetings={meetings}
        onPick={onPickMeeting}
        onCreate={onCreateMeeting}
      />
    )}
  </div>
);

const DoctorHome = ({
  onOpen,
  onGoPatients,
  onGoPlan,
  onGoRx,
  onGoDischarge,
  onGoChat,
}: {
  onOpen: (k: SheetKey) => void;
  onGoPatients: (filter?: PatientFilter) => void;
  onGoPlan: (stage: PlanStage) => void;
  onGoRx: () => void;
  onGoDischarge: () => void;
  onGoChat: () => void;
}) => {
  return (
    <div className="pb-4">
      {/* 顶部白色头部 */}
      <div className="bg-background px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">早上好</div>
            <div className="text-xl font-bold mt-0.5 text-foreground">李医师 👋</div>
            <div className="text-[11px] text-muted-foreground mt-1">康复医师 · 共 {PATIENTS.length} 位患者</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onOpen("patientChatList")} className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center relative">
              <MessageCircle className="w-4 h-4" />
              {PATIENT_UNREAD > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-warning text-white text-[10px] font-bold flex items-center justify-center">
                  {PATIENT_UNREAD}
                </span>
              )}
            </button>
            <button onClick={() => toast("您有 3 条新提醒")} className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-3 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[13px] font-bold text-foreground">今日待处理</span>
            <button onClick={() => onGoPlan("plan")} className="text-[11px] text-primary font-medium flex items-center">
              点击进入处理 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <PendingTodoGrid
            items={[
              { label: "待首次评估", count: FIRST_ASSESS_COUNT, icon: ClipboardCheck, iconClass: "bg-warning text-white", onClick: () => onGoPatients("待首次评估") },
              { label: "退回重评", count: RETURNED_REASSESS_COUNT, icon: AlertTriangle, iconClass: "bg-destructive text-white", onClick: () => onGoPatients("退回重评") },
              { label: "待设定目标", count: 3, icon: Target, iconClass: "bg-primary text-white", onClick: () => onGoPlan("goal") },
              { label: "待确认方案", count: 3, icon: FileText, iconClass: "bg-secondary text-white", onClick: () => onGoPlan("plan") },
              { label: "待确认医嘱", count: 4, icon: Sparkles, iconClass: "bg-success text-white", onClick: onGoRx },
              { label: "待出院", count: PATIENTS.filter(p => getPatientStage(p) === "待出院").length, icon: LogOut, iconClass: "bg-destructive text-white", onClick: () => onGoPatients("待出院") },
            ]}
          />
        </div>

        <div>
          <SectionTitle
            title="今日紧急待办"
            extra={<button onClick={() => onGoPlan("plan")} className="text-xs text-primary font-medium flex items-center">全部 <ChevronRight className="w-3 h-3" /></button>}
          />
          <div className="space-y-2">
            <PatientTaskCard onClick={() => onGoPatients("退回重评")} patient="退回重评 · 重新首次评估" tag={`共 ${RETURNED_REASSESS_COUNT} 位患者`} task="赵子轩 318 / 黄淑芬 320 · 治疗师与护士反馈与首评不符，需医师重新组织首评" urgency="high" time="今日 09:30" />
            <PatientTaskCard onClick={() => onGoPlan("plan")} patient="待确认 AI 方案" tag="共 3 位患者" task="点击进入方案确认列表，逐位审核" urgency="high" time="10:30 团队会议" />
            <PatientTaskCard onClick={() => onGoPatients("待首次评估")} patient="待首次评估" tag={`共 ${FIRST_ASSESS_COUNT} 位患者`} task="团队线上接入 · 进入患者列表" urgency="medium" time="今日" />
            <PatientTaskCard onClick={onGoDischarge} patient="待二次确认出院方案" tag="共 2 位患者" task="AI 二级方案待医师二次确认" urgency="low" time="今日" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientTaskCard = ({ patient, tag, task, urgency, time, onClick }: {
  patient: string; tag: string; task: string; urgency: "high" | "medium" | "low"; time: string; onClick?: () => void;
}) => {
  const urgencyMap = {
    high: { color: "bg-destructive/10 text-destructive", label: "紧急" },
    medium: { color: "bg-warning/15 text-warning", label: "重要" },
    low: { color: "bg-primary/10 text-primary", label: "常规" },
  }[urgency];
  return (
    <button onClick={onClick} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99] transition-transform">
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="text-[13px] font-semibold text-foreground">{patient}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{tag}</div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${urgencyMap.color}`}>{urgencyMap.label}</span>
      </div>
      <div className="text-[12px] text-foreground/80 leading-relaxed">{task}</div>
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/60">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {time}</span>
        <span className="text-[11px] text-primary font-semibold flex items-center">查看 <ChevronRight className="w-3 h-3" /></span>
      </div>
    </button>
  );
};

const DoctorMe = ({ onOpenTeam }: { onOpenTeam: () => void }) => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-doctor flex items-center justify-center text-white text-xl font-bold">李</div>
      <div>
        <div className="text-base font-bold">李志远 主任医师</div>
        <div className="text-xs text-muted-foreground mt-0.5">神经康复科 · 从业 18 年</div>
        <div className="flex gap-1.5 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">脑卒中</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-soft text-secondary font-medium">脊髓损伤</span>
        </div>
      </div>
    </div>

    <MeStats
      accent="doctor"
      tiles={[
        { label: "本月接诊", value: 86, sub: "患者人次" },
        { label: "方案确认", value: 124, sub: "AI 方案" },
        { label: "团队会议", value: 18, sub: "次" },
      ]}
      trend={[
        { day: "一", value: 12 }, { day: "二", value: 15 }, { day: "三", value: 9 },
        { day: "四", value: 18 }, { day: "五", value: 14 }, { day: "六", value: 6 }, { day: "日", value: 4 },
      ]}
    />

    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-doctor" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      {[
        { label: "我的患者", info: `当前共 ${PATIENTS.length} 位患者，新患者 ${NEW_PATIENT_COUNT} 位` },
        { label: "评估记录", info: "本月已完成 86 份首次评估，详情已同步至档案" },
        { label: "AI 偏好设置", info: "AI 风险偏好：保守 · 处方默认 4 周复评" },
        { label: "帮助与反馈", info: "客服电话：400-021-8866，工单已为您准备" },
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

const AI_DEFAULT_CONCLUSION = `综合判定：急性缺血性卒中后右侧偏瘫，NIHSS 14 分（中度），mRS 4 级（中重度残疾）。
当前主要功能障碍：右上下肢运动重度受损（肌力 2 级）、轻度表达性失语、左侧空间忽略、吞咽可疑异常。
合并高跌倒/DVT/压疮风险与营养及认知风险，整体康复潜力中等。
建议方向：① 床旁早期 PT（良肢位、被动 ROM、坐位平衡）；② OT 介入 ADL + 视空间忽略训练；③ ST 进行吞咽与构音训练，暂予糊状饮食；④ 护理重点落实跌倒/压疮/DVT 三大预防 + 营养支持；⑤ 7 天后复评 NIHSS / mRS / MoCA，必要时再次发起 MDT。`;

const AssessSheet = ({ patient, onLaunchMeeting }: { patient?: string; onLaunchMeeting: () => void }) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  const [editing, setEditing] = useState(false);
  const [conclusion, setConclusion] = useState(AI_DEFAULT_CONCLUSION);
  const [draft, setDraft] = useState(conclusion);

  return (
    <div className="p-4 space-y-3">
      <button
        onClick={onLaunchMeeting}
        className="w-full bg-warning-soft border border-warning/30 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99]"
      >
        <div className="w-9 h-9 rounded-xl bg-warning text-white flex items-center justify-center">
          <Users className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[12px] font-semibold text-warning">就该患者发起团队会议</div>
          <div className="text-[10px] text-muted-foreground">医师 / 治疗师 / 护士线上协同 · AI 自动记录纪要</div>
        </div>
        <ChevronRight className="w-4 h-4 text-warning" />
      </button>

      {/* 1. 患者基本信息 */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "张建国 · 男 68 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">床号 303 · 病案号 ZY-052266 · 主诊：李敏 副主任医师</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-primary-soft text-primary font-semibold">首次评估</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">发病时间</div><div className="text-[11px] font-semibold mt-0.5">05-06 19:20</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">评估日期</div><div className="text-[11px] font-semibold mt-0.5">05-08 第2天</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">诊断</div><div className="text-[11px] font-semibold mt-0.5">急性缺血卒中</div></div>
        </div>
      </div>

      {/* 2. 核心评分 */}
      <SectionTitle title="核心评分" />
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card rounded-2xl shadow-card p-3">
          <div className="text-[10px] text-muted-foreground">NIHSS</div>
          <div className="text-2xl font-bold text-primary mt-1">14<span className="text-xs text-muted-foreground ml-1">分</span></div>
          <div className="text-[10px] text-warning font-semibold mt-1">中度卒中 (5–15)</div>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-3">
          <div className="text-[10px] text-muted-foreground">mRS（当前）</div>
          <div className="text-2xl font-bold text-primary mt-1">4<span className="text-xs text-muted-foreground ml-1">级</span></div>
          <div className="text-[10px] text-warning font-semibold mt-1">中重度残疾</div>
        </div>
      </div>

      {/* 3. NIHSS 详细 */}
      <SectionTitle title="NIHSS 详细条目" extra={<span className="text-[10px] text-muted-foreground">总分 14</span>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="1a. 意识水平" value="1 分" hint="嗜睡，轻微刺激能唤醒" />
        <FormRow label="1b. 提问（月份/年龄）" value="1 分" hint="仅月份正确" />
        <FormRow label="1c. 指令（睁闭眼/握拳）" value="1 分" hint="仅完成睁闭眼" />
        <FormRow label="2. 水平凝视" value="1 分" hint="部分凝视麻痹（右向欠充分）" />
        <FormRow label="3. 视野" value="1 分" hint="左侧同向偏盲" />
        <FormRow label="4. 面瘫" value="2 分" hint="右侧鼻唇沟浅，下面部瘫痪" />
        <FormRow label="5a. 左上肢运动" value="0 分" hint="正常" />
        <FormRow label="5b. 右上肢运动" value="3 分" hint="不能抵抗重力，快速下落" />
        <FormRow label="6a. 左下肢运动" value="0 分" hint="正常" />
        <FormRow label="6b. 右下肢运动" value="3 分" hint="立即下落，肌力 2 级" />
        <FormRow label="7. 肢体共济失调" value="1 分" hint="右侧跟膝胫试验不稳" />
        <FormRow label="8. 感觉" value="1 分" hint="右侧肢体针刺感减退" />
        <FormRow label="9. 语言" value="1 分" hint="轻度表达性失语" />
        <FormRow label="10. 构音障碍" value="1 分" hint="说话含糊但可被理解" />
        <FormRow label="11. 忽视/注意" value="1 分" hint="左侧空间忽略" />
      </div>

      {/* 4. mRS */}
      <SectionTitle title="mRS 改良 Rankin 量表" />
      <div className="bg-card rounded-2xl shadow-card p-4 space-y-1.5">
        <div className="text-[12px] font-semibold text-warning">4 级 — 中重度残疾</div>
        <ul className="text-[11px] text-foreground/80 leading-relaxed list-disc pl-4 space-y-0.5">
          <li>无法独立行走，需一人扶持或使用轮椅</li>
          <li>穿衣、如厕、进食等需大量帮助</li>
          <li>每日需要看护至少 2 次</li>
          <li>不能独立完成自我照料</li>
        </ul>
      </div>

      {/* 5. 并发症风险 */}
      <SectionTitle title="并发症风险评估" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="跌倒风险 · Morse" value={<span className="text-destructive font-semibold">高 55 分</span>} hint="偏瘫/步态不稳/认知忽略 · 床栏 + 陪护下离床" />
        <FormRow label="压疮风险 · Braden" value={<span className="text-warning font-semibold">中 16 分</span>} hint="活动受限、感觉减退 · 每 2h 翻身 + 减压气垫" />
        <FormRow label="吞咽风险 · 洼田饮水" value={<span className="text-warning font-semibold">可疑异常 3 级</span>} hint="饮水呛咳 · 糊状饮食 + 口肌训练" />
        <FormRow label="DVT 风险 · Caprini" value={<span className="text-destructive font-semibold">高危 5 分</span>} hint="偏瘫制动 + 高龄 · IPC + 低分子肝素预防" />
      </div>

      {/* 6. 营养与认知 */}
      <SectionTitle title="营养与认知状态" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="营养 · NRS2002" value={<span className="text-warning font-semibold">3 分（有风险）</span>} hint="进食量减少 50%，体重下降 3kg，白蛋白 32g/L" />
        <FormRow label="认知 · MoCA 基础版" value={<span className="text-warning font-semibold">18/30（轻度损害）</span>} hint="执行/视空间（左忽略）/延迟回忆受损，定向力尚可" />
      </div>

      {/* AI 辅助结论 + 自定义编辑 */}
      <AICard
        title="AI 首次评估辅助结论"
        action={
          editing ? (
            <div className="flex gap-2">
              <button
                className="flex-1 border border-border rounded-xl py-2 text-xs font-semibold"
                onClick={() => { setDraft(conclusion); setEditing(false); }}
              >取消</button>
              <button
                className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold"
                onClick={() => { setDraft(AI_DEFAULT_CONCLUSION); toast("已重新生成 AI 结论"); }}
              >重新生成</button>
              <button
                className="flex-1 gradient-doctor text-white rounded-xl py-2 text-xs font-semibold"
                onClick={() => { setConclusion(draft); setEditing(false); toast.success("结论已保存"); }}
              >保存</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold"
                onClick={onLaunchMeeting}
              >结果不确定 · 发起会议</button>
              <button
                className="flex-1 gradient-doctor text-white rounded-xl py-2 text-xs font-semibold"
                onClick={() => { setDraft(conclusion); setEditing(true); }}
              >编辑结论</button>
            </div>
          )
        }
      >
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full min-h-[160px] text-[12px] leading-relaxed bg-background/60 border border-ai/20 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-ai/40"
          />
        ) : (
          <div className="whitespace-pre-line text-[12px] leading-relaxed">{conclusion}</div>
        )}
        <div className="mt-2 text-[10px] text-muted-foreground">评估医师：康复医学科 王敏 · 审核：卒中中心 MDT</div>
      </AICard>
    </div>
  );
};

const PatientHeader = ({ patient, label }: { patient?: string; label: string }) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
        <div className="flex-1">
          <div className="text-sm font-bold">{patient || "张建国 · 男 56 · 床303"}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">脑卒中后偏瘫 · 入院第 12 天 · 主管医师：李志远</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-primary-soft text-primary font-semibold">{label}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatChip label="FMA" value="42" accent="primary" />
        <StatChip label="Barthel" value="70" accent="success" />
        <StatChip label="VAS" value="3" accent="warning" />
      </div>
    </div>
  );
};

const GoalSheet = ({ patient }: { patient?: string }) => (
  <div className="p-4 space-y-3">
    <PatientHeader patient={patient} label="康复目标" />
    <AICard title="AI 智能设定康复目标">
      基于评估数据与同类病例匹配，AI 已生成 4 周分阶段目标。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="短期目标 (1 周)" value={<input defaultValue="床椅转移独立完成" className="w-44 text-right bg-muted rounded px-2 py-1 text-xs" />} />
      <FormRow label="中期目标 (2 周)" value={<input defaultValue="助行器辅助步行 30m" className="w-44 text-right bg-muted rounded px-2 py-1 text-xs" />} />
      <FormRow label="长期目标 (4 周)" value={<input defaultValue="独立步行 ≥ 50m，FMA +8" className="w-44 text-right bg-muted rounded px-2 py-1 text-xs" />} />
      <FormRow label="ADL 目标" value={<input defaultValue="Barthel ≥ 75" className="w-44 text-right bg-muted rounded px-2 py-1 text-xs" />} />
    </div>
    <button className="w-full flex items-center justify-center gap-1 text-xs text-ai font-semibold py-2" onClick={() => toast("已新增自定义目标项")}>
      <Plus className="w-3.5 h-3.5" /> 新增自定义目标
    </button>
  </div>
);

const PlanSheet = ({ patient, onLaunchMeeting }: { patient?: string; onLaunchMeeting?: () => void }) => (
  <div className="p-4 space-y-3">
    <PatientHeader patient={patient} label="康复方案" />
    {onLaunchMeeting && (
      <button
        onClick={onLaunchMeeting}
        className="w-full bg-warning-soft border border-warning/30 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99]"
      >
        <div className="w-9 h-9 rounded-xl bg-warning text-white flex items-center justify-center">
          <Video className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[12px] font-semibold text-warning">就该方案发起在线团队会议</div>
          <div className="text-[10px] text-muted-foreground">医师 / 治疗师 / 护士线上协同确认 · AI 自动纪要</div>
        </div>
        <ChevronRight className="w-4 h-4 text-warning" />
      </button>
    )}
    <AICard title="AI 生成的康复方案 V2">
      基于本周评估更新方案：PT 强度 +20%、新增 OT 厨房训练、ST 维持原计划。
    </AICard>
    <SectionTitle title="方案明细" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="PT 物理治疗" value="60 min × 5/周" hint="步态 + 平衡 + 力量" />
      <FormRow label="OT 作业治疗" value="45 min × 5/周" hint="ADL + 厨房 + 书写" />
      <FormRow label="ST 言语治疗" value="30 min × 3/周" hint="构音 + 吞咽" />
      <FormRow label="物理因子" value="20 min × 5/周" hint="低频电刺激" />
      <FormRow label="药物联动" value="维持" hint="详见护理端医嘱" />
    </div>
    <AICard title="AI 方案差异提醒">
      与上版相比：训练总时长 +25%，建议会议关注患者耐受度与疲劳指数。
    </AICard>
  </div>
);

const RxSheet = ({ patient }: { patient?: string }) => (
  <RxDetail patient={patient} accent="doctor" />
);

const DischargeSheet = () => (
  <div className="p-4 space-y-3">
    {/* 患者基本信息 */}
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold text-lg">李</div>
        <div className="flex-1">
          <div className="text-sm font-bold">李 强 · 男 42 · 床307</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">脊髓损伤 · 入院第 28 天 · 主管医师：李志远</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-success-soft text-success font-semibold">待出院</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <StatChip label="FMA" value="58" accent="primary" />
        <StatChip label="Barthel" value="85" accent="success" />
        <StatChip label="Berg" value="48" accent="success" />
        <StatChip label="VAS" value="1" accent="warning" />
      </div>
    </div>

    <SectionTitle title="档案 / 在院信息" extra={<span className="text-[10px] text-muted-foreground">完整电子病历</span>} />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="主诉" value="T10 平面以下运动障碍 4 个月" />
      <FormRow label="既往史" value="无特殊" hint="否认高血压 / 糖尿病" />
      <FormRow label="手术史" value="2026-04-01 椎管减压 + 内固定" />
      <FormRow label="入院诊断" value="不完全性脊髓损伤 · ASIA C" />
      <FormRow label="并发症筛查" value="DVT 阴性 · 压疮 0 期" />
      <FormRow label="过敏 / 医保" value="无 · 城镇职工" />
    </div>

    <SectionTitle title="多角色康复方案汇总" extra={<span className="text-[10px] text-muted-foreground">医师 / PT / OT / ST / 护理</span>} />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="医师 · 总体方案" value="渐进负重 + 神经促通" hint="李志远 · 第 4 周方案" />
      <FormRow label="PT · 物理治疗" value="60 min × 5/周" hint="步态 + 平衡 + 力量 · 王雅琴" />
      <FormRow label="OT · 作业治疗" value="45 min × 5/周" hint="ADL + 厨房 · 陈治疗师" />
      <FormRow label="ST · 言语治疗" value="30 min × 3/周" hint="构音 · 陈思雨" />
      <FormRow label="护理 · 康复护理" value="q4h 体位 + 皮肤护理" hint="赵静怡 · 主管护师" />
      <FormRow label="心理 · 出院适应" value="家属同伴支持" hint="孙博士" />
    </div>

    <SectionTitle title="近 7 日康复执行 / 用药记录" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="今日 PT" value="步行 60m" hint="独立完成 · Borg 9" />
      <FormRow label="今日 OT" value="厨房 ADL" hint="独立完成 · 30 min" />
      <FormRow label="昨日 PT" value="上下楼" hint="扶手辅助 · 双足交替" />
      <FormRow label="昨日 ST" value="构音清晰度 92%" hint="EAT-10：2" />
      <FormRow label="本周用药" value="停巴氯芬 / 加 VitB" hint="李医师 · 本周三调整" />
      <FormRow label="护理打卡" value="14 / 14 项" hint="系统自动记录" />
    </div>

    <AICard title="AI 生成的院外二级方案 · 待二次确认">
      AI 综合上述在院档案、5 角色方案及 28 天康复执行数据生成院外二级方案，请医师二次确认。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="家庭训练" value="每日 60 min" hint="PT 视频指导 × 3 节" />
      <FormRow label="远程随访" value="每周 1 次" hint="医师视频回访 + 量表" />
      <FormRow label="紧急预警" value="跌倒 / 疼痛突增" hint="自动通知医师 + 家属" />
      <FormRow label="社区对接" value="徐汇康复站" hint="每周 2 次门诊治疗" />
      <FormRow label="复诊节点" value="2 / 4 / 8 周" />
      <FormRow label="家属培训" value="跌倒预防 + 转移技巧" hint="出院前 1 日完成" />
    </div>

    <SectionTitle title="出院条件复核" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="独立步行 ≥ 50m" value={<CheckCircle2 className="w-4 h-4 text-success" />} hint="实测 60m" />
      <FormRow label="Barthel ≥ 75" value={<CheckCircle2 className="w-4 h-4 text-success" />} hint="实测 85" />
      <FormRow label="家属照护培训完成" value={<CheckCircle2 className="w-4 h-4 text-success" />} />
      <FormRow label="无急性并发症" value={<CheckCircle2 className="w-4 h-4 text-success" />} />
    </div>
  </div>
);
