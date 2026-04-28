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
  IMChatSheet,
  TeamMeetingListSheet,
  NewMeetingSheet,
  PatientChatListSheet,
  PatientChatSheet,
  Patient,
  PatientFilter,
  PATIENTS,
  NEW_PATIENT_COUNT,
  FIRST_ASSESS_COUNT,
  PATIENT_UNREAD,
  DEFAULT_MEETING_MSGS,
  DEFAULT_VIDEO_MSGS,
  DEFAULT_MEETINGS,
  TeamMeeting,
} from "@/components/app/PatientsModule";
import { RehabPlanModule, PlanStage } from "@/components/app/RehabPlanModule";
import { toast } from "sonner";
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
  { key: "discharge", label: "出院方案", icon: LogOut },
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
          onGoDischarge={() => setTab("discharge")}
        />
      )}
      {tab === "patients" && <PatientsPage accent="doctor" onPick={pickPatient} initialFilter={patientsFilter} />}
      {tab === "plan" && (
        <RehabPlanModule
          accent="doctor"
          onPickPlan={pickPlanPatient}
          initialStage={planStage}
          stages={["goal", "plan", "airx"]}
          title="康复方案"
          subtitle="目标 / 方案 / 康复处方"
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
      {tab === "me" && <DoctorMe onOpenTeam={() => open("team")} />}

      <PhoneSheet open={sheet === "assess"} onClose={close} title={`首次康复评估${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={
          <div className="flex gap-2">
            <button onClick={() => toast("已打开治疗师选择 · 王雅琴 / 陈治疗师 / 陈思雨")} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-1">
              <UserPlus className="w-4 h-4" />指定治疗师
              <span className="text-[10px] text-muted-foreground">（可选）</span>
            </button>
            <button onClick={() => { toast.success("评估结果已确认"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">确认</button>
          </div>
        }>
        <AssessSheet patient={activePatient} onLaunchMeeting={() => { setActiveMeeting(null); setSheet("meeting"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title={`AI 康复目标${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <div className="flex gap-2">
            <button onClick={() => toast("已切换到手动调整")} className="flex-1 border border-ai/30 text-ai rounded-2xl py-3 text-sm font-semibold">手动调整</button>
            <button onClick={() => { toast.success("康复目标已同步治疗师"); close(); }} className="flex-1 gradient-ai text-white rounded-2xl py-3 text-sm font-semibold">同步治疗师</button>
          </div>
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

      <PhoneSheet open={sheet === "rx"} onClose={close} title={`确认康复处方${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={
          <div className="flex gap-2">
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

      <PhoneSheet open={sheet === "video"} onClose={close} title="线上会诊" accent="doctor" flush hideHeader>
        <IMChatSheet
          accent="doctor"
          title="线上团队会诊"
          subtitle="王秀英 · 髋关节术后会诊"
          participants={["李医师", "王治疗师", "赵护士"]}
          initialMessages={DEFAULT_VIDEO_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          onClose={close}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChatList"} onClose={close} title="患者沟通" accent="doctor">
        <PatientChatListSheet accent="doctor" onPick={(p) => { setChatPatient(p); setSheet("patientChat"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChat"} onClose={() => setSheet("patientChatList")} title="患者沟通" accent="doctor" flush hideHeader>
        <PatientChatSheet accent="doctor" patient={chatPatient} onClose={() => setSheet("patientChatList")} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientDetail"} onClose={close} title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`} accent="doctor">
        <PatientDetailSheet
          patient={pickedPatient}
          accent="doctor"
          onAddNote={() => setSheet("addNote")}
          onShare={() => toast.success("已打开共享设置")}
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
    </ScreenShell>
  );
};

const DoctorHome = ({
  onOpen,
  onGoPatients,
  onGoPlan,
  onGoDischarge,
}: {
  onOpen: (k: SheetKey) => void;
  onGoPatients: (filter?: PatientFilter) => void;
  onGoPlan: (stage: PlanStage) => void;
  onGoDischarge: () => void;
}) => {
  // 工作台仅保留：患者管理、团队会议、患者沟通、线上会诊（首评/目标/方案/AI处方已上移到顶部待办统计）
  const tiles = [
    { icon: UsersRound, label: "患者管理", color: "text-primary bg-primary-soft", count: PATIENTS.length, onClick: () => onGoPatients("all") },
    { icon: Users, label: "团队会议", color: "text-warning bg-warning-soft", count: DEFAULT_MEETINGS.length, onClick: () => onOpen("meetingList") },
    { icon: MessageCircle, label: "患者沟通", color: "text-ai bg-ai-soft", count: PATIENT_UNREAD, onClick: () => onOpen("patientChatList") },
    { icon: Video, label: "线上会诊", color: "text-primary bg-primary-soft", onClick: () => onOpen("video") },
  ];
  return (
    <div className="pb-4">
      {/* 顶部留出空间避免 Dynamic Island，与底部统计一起紧凑布局 */}
      <div className="gradient-doctor px-5 pt-6 pb-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">早上好</div>
            <div className="text-xl font-bold mt-0.5">李医师 👋</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onOpen("patientChatList")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
              <MessageCircle className="w-4 h-4" />
              {PATIENT_UNREAD > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-warning text-white text-[10px] font-bold flex items-center justify-center">
                  {PATIENT_UNREAD}
                </span>
              )}
            </button>
            <button onClick={() => toast("您有 3 条新提醒")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
            </button>
          </div>
        </div>

        <div className="relative mt-3">
          <PendingStatRow
            items={[
              { label: "待首次评估", count: FIRST_ASSESS_COUNT, onClick: () => onGoPatients("待首次评估") },
              { label: "待设定目标", count: 3, onClick: () => onGoPlan("goal") },
              { label: "待确认方案", count: 3, onClick: () => onGoPlan("plan") },
              { label: "待确认AI处方", count: 4, onClick: () => onGoPlan("airx") },
            ]}
          />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div>
          <SectionTitle title="医师工作台 · 点击进入对应模块" />
          <div className="grid grid-cols-4 gap-2">
            {tiles.map((it) => (
              <WorkbenchTile
                key={it.label}
                icon={it.icon}
                label={it.label}
                color={it.color}
                count={it.count}
                onClick={it.onClick}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle
            title="今日紧急待办"
            extra={<button onClick={() => onGoPlan("plan")} className="text-xs text-primary font-medium flex items-center">全部 <ChevronRight className="w-3 h-3" /></button>}
          />
          <div className="space-y-2">
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
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-doctor" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      {["我的患者", "评估记录", "AI 偏好设置", "帮助与反馈"].map((it) => (
        <button key={it} onClick={() => toast(it + " · 即将开放")} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===================== Sheets ===================== */

const AssessSheet = ({ patient, onLaunchMeeting }: { patient?: string; onLaunchMeeting: () => void }) => {
  const name = patient ? patient.split(" ")[0] : "王秀英";
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

      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "王秀英 · 女 68 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">床号 305 · 入院第 5 天 · 主管医师：李志远</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-primary-soft text-primary font-semibold">首次评估</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">身高/体重</div><div className="text-[11px] font-semibold mt-0.5">158 / 56</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">血型 / 过敏</div><div className="text-[11px] font-semibold mt-0.5">A 型 / 无</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">医保</div><div className="text-[11px] font-semibold mt-0.5">城镇职工</div></div>
        </div>
      </div>

      <SectionTitle title="档案信息" extra={<button onClick={() => toast("已查看完整电子病历")} className="text-[11px] text-primary font-semibold flex items-center"><FileHeart className="w-3 h-3 mr-1" />完整病历</button>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="主诉" value="右髋疼痛伴活动受限 3 个月" />
        <FormRow label="现病史" value="跌倒致伤 ▾" hint="术前 X 线示右股骨颈骨折" />
        <FormRow label="既往史" value="高血压 8 年 · 2 型糖尿病 5 年" hint="降压、降糖药规律服用" />
        <FormRow label="手术史" value="2026-04-23 右髋关节置换术" />
        <FormRow label="家族史" value="父：脑卒中；母：冠心病" />
        <FormRow label="过敏史" value="无" />
      </div>

      <SectionTitle title="入院病症与体征" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="意识 / 认知" value="清醒 · MMSE 28" />
        <FormRow label="肌力（右下肢）" value="III 级" hint="髋屈 / 伸 III 级，膝伸 IV 级" />
        <FormRow label="ROM 屈曲" value="60° / 100°" hint="左 / 右" />
        <FormRow label="肌张力 (MAS)" value="0 级" />
        <FormRow label="负重耐受" value="患肢 30%" hint="术后渐进负重" />
        <FormRow label="感觉" value="正常" />
        <FormRow label="伤口情况" value="愈合良好" />
        <FormRow label="并发症风险" value="DVT 中风险 · 跌倒高风险" />
      </div>

      <AICard title="AI 风险与病史智能分析">
        基于上述基本信息 + 档案 + 体征：跌倒高风险 ★★★ · DVT 中风险 ★★ · 疼痛 6/10。
        合并糖尿病：建议关注伤口愈合与运动负荷；高血压：注意运动中血压监测。
        推荐优先评估：Harris 髋关节、Berg 平衡、Barthel ADL、ROM。
      </AICard>

      <SectionTitle title="评估量表（团队线上协同）" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="Harris 髋关节评分" value="65 ✓" hint="负责：王治疗师 · 已完成" />
        <FormRow label="VAS 疼痛评分" value="6 / 10" hint="负责：赵护士 · 已完成" />
        <FormRow label="Berg 平衡量表" value="32 分" hint="负责：王治疗师 · 已完成" />
        <FormRow label="Barthel 指数" value="55 分" hint="负责：李医师 · 已完成" />
        <FormRow label="DVT Wells" value="2 分（中）" hint="负责：赵护士 · 已完成" />
      </div>

      <AICard title="AI 评估结果初判" action={
        <div className="flex gap-2">
          <button className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold" onClick={onLaunchMeeting}>
            结果不确定 · 发起会议
          </button>
        </div>
      }>
        综合判定：术后早期，疼痛是主要限制因素；康复潜力良好。建议进入「目标设定 → 方案制定」，重点：疼痛干预 + 渐进负重 + 平衡训练。
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
      <FormRow label="短期目标 (1 周)" value={<button className="text-primary text-xs flex items-center gap-1"><Edit3 className="w-3 h-3" />编辑</button>} hint="床椅转移独立完成" />
      <FormRow label="中期目标 (2 周)" value={<button className="text-primary text-xs flex items-center gap-1"><Edit3 className="w-3 h-3" />编辑</button>} hint="助行器辅助步行 30m" />
      <FormRow label="长期目标 (4 周)" value={<button className="text-primary text-xs flex items-center gap-1"><Edit3 className="w-3 h-3" />编辑</button>} hint="独立步行 ≥ 50m，FMA 提升 ≥ 8 分" />
      <FormRow label="ADL 目标" value="Barthel ≥ 75" hint="独立完成穿衣、如厕" />
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
  <div className="p-4 space-y-3">
    <PatientHeader patient={patient} label="康复处方" />
    <AICard title="AI 自动生成的康复处方建议">
      基于已确认方案，自动生成至治疗师端，请确认或调整。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2">
      {[
        { type: "PT", name: "下肢力量训练", set: "3 组 × 10 次", freq: "每日" },
        { type: "PT", name: "平衡板训练", set: "15 分钟", freq: "每日" },
        { type: "OT", name: "穿衣 ADL", set: "20 分钟", freq: "每日" },
        { type: "OT", name: "厨房活动", set: "25 分钟", freq: "3次/周" },
        { type: "ST", name: "构音训练", set: "30 分钟", freq: "3次/周" },
      ].map((r) => (
        <div key={r.name} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
          <span className="text-[10px] px-2 py-0.5 rounded bg-primary-soft text-primary font-bold">{r.type}</span>
          <div className="flex-1">
            <div className="text-[12px] font-semibold">{r.name}</div>
            <div className="text-[10px] text-muted-foreground">{r.set} · {r.freq}</div>
          </div>
          <button className="text-[11px] text-primary"><Edit3 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  </div>
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
