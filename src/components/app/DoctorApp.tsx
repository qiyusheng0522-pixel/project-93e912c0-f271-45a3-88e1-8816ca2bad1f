import { useState } from "react";
import { ScreenShell, TabBar } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, TodoItem } from "@/components/app/TodoQueue";
import {
  PatientsPage,
  PatientDetailSheet,
  AddNoteSheet,
  TeamManageSheet,
  IMChatSheet,
  Patient,
  PATIENTS,
  NEW_PATIENT_COUNT,
  DEFAULT_MEETING_MSGS,
  DEFAULT_VIDEO_MSGS,
} from "@/components/app/PatientsModule";
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
  Activity,
  Stethoscope,
  Calendar,
  TrendingUp,
  ArrowRight,
  Video,
  Plus,
  Edit3,
  Send,
  Home as HomeIcon,
  UsersRound,
  HeartHandshake,
  FileHeart,
  Pill,
  AlertTriangle,
} from "lucide-react";

type SheetKey =
  | null
  | "assess"
  | "goal"
  | "plan"
  | "meeting"
  | "rx"
  | "monitor"
  | "discharge"
  | "video"
  | "patient"
  | "aiUpdate"
  | "aiDischarge"
  | "patientDetail"
  | "addNote"
  | "team";

type QueueKey =
  | "assess"
  | "goal"
  | "plan"
  | "meeting"
  | "rx"
  | "monitor"
  | "discharge";

const QUEUE_TITLE: Record<QueueKey, string> = {
  assess: "待评估患者",
  goal: "待设定康复目标",
  plan: "待确认康复方案",
  meeting: "待召开团队会议",
  rx: "待确认 AI 处方",
  monitor: "持续评估中患者",
  discharge: "待生成出院方案",
};

// Mock pending pools per task type
const QUEUES: Record<QueueKey, TodoItem[]> = {
  assess: [
    { id: "a1", patient: "王秀英 · 女 68", meta: "髋关节置换术后第 5 天", detail: "首次康复评估 · 团队线上待接入", time: "今日 14:00", urgency: "high" },
    { id: "a2", patient: "周建华 · 男 72", meta: "脑梗死 · 入院第 2 天", detail: "首次评估 · AI 已生成初判", time: "今日 15:30", urgency: "high" },
    { id: "a3", patient: "赵小芳 · 女 45", meta: "脊髓损伤 T6 · 入院第 1 天", detail: "首次评估 · 待团队接入", time: "今日 16:00", urgency: "medium" },
    { id: "a4", patient: "孙德强 · 男 60", meta: "膝关节置换术后", detail: "首次评估", time: "明日 09:00", urgency: "medium" },
    { id: "a5", patient: "吴丽君 · 女 55", meta: "颅脑外伤", detail: "首次评估 · 复杂病例", time: "明日 10:30", urgency: "low" },
  ],
  goal: [
    { id: "g1", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "AI 已生成 4 周目标，待医师确认", urgency: "high" },
    { id: "g2", patient: "陈丽华 · 女 65", meta: "认知障碍", detail: "AI 目标待手动调整", urgency: "medium" },
    { id: "g3", patient: "刘伟明 · 男 38", meta: "颈髓损伤", detail: "AI 目标已生成", urgency: "medium" },
    { id: "g4", patient: "黄彩霞 · 女 72", meta: "髋部骨折术后", detail: "AI 目标已生成", urgency: "low" },
  ],
  plan: [
    { id: "p1", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "AI 生成的康复方案 V2 · 训练强度 +25%", time: "10:30 团队会议", urgency: "high" },
    { id: "p2", patient: "李 强 · 男 42", meta: "脊髓损伤", detail: "方案微调建议 · 增加 OT 时长", urgency: "medium" },
    { id: "p3", patient: "陈丽华 · 女 65", meta: "认知障碍", detail: "新方案待确认", urgency: "low" },
  ],
  meeting: [
    { id: "m1", patient: "张建国 · V2 方案讨论", meta: "今日 10:30 · 5 人参会", detail: "议题：训练强度提升、出院条件评估", time: "10:30", urgency: "high" },
    { id: "m2", patient: "王秀英 · 评估复议", meta: "今日 16:00 · 3 人参会", detail: "议题：术后疼痛干预方向", time: "16:00", urgency: "medium" },
  ],
  rx: [
    { id: "r1", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "AI 处方建议：PT 5/周 + OT 5/周 + ST 3/周", urgency: "high" },
    { id: "r2", patient: "李 强 · 男 42", meta: "脊髓损伤", detail: "AI 处方更新建议", urgency: "medium" },
    { id: "r3", patient: "陈丽华 · 女 65", meta: "认知障碍", detail: "ST 处方建议", urgency: "medium" },
    { id: "r4", patient: "周建华 · 男 72", meta: "脑梗死恢复期", detail: "首版 AI 处方", urgency: "low" },
  ],
  monitor: [
    { id: "mo1", patient: "张建国", meta: "入院第 12 天", detail: "FMA +8 · Barthel 70 · 接近出院线", urgency: "medium" },
    { id: "mo2", patient: "李 强", meta: "入院第 28 天", detail: "Barthel 76 · 满足出院条件 ✓", urgency: "high" },
    { id: "mo3", patient: "王秀英", meta: "入院第 5 天", detail: "Harris 65 · 持续进步", urgency: "low" },
    { id: "mo4", patient: "陈丽华", meta: "入院第 18 天", detail: "MMSE 进步缓慢", urgency: "low" },
  ],
  discharge: [
    { id: "d1", patient: "李 强 · 男 42", meta: "脊髓损伤 · 已满足出院条件", detail: "AI 已生成二级方案 · 待调整确认", urgency: "high" },
    { id: "d2", patient: "钱志国 · 男 65", meta: "脑卒中恢复期", detail: "AI 二级方案预览", urgency: "medium" },
  ],
};

export const DoctorApp = () => {
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
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="doctor" newPatientCount={NEW_PATIENT_COUNT} />}>
      {tab === "home" && <DoctorHome onOpen={open} onOpenQueue={openQueue} onGoPatients={() => setTab("patients")} />}
      {tab === "tasks" && <DoctorTasks onOpen={open} onOpenQueue={openQueue} />}
      {tab === "patients" && <PatientsPage accent="doctor" onPick={pickPatient} />}
      {tab === "ai" && <DoctorAI onOpen={open} />}
      {tab === "me" && <DoctorMe onOpenTeam={() => open("team")} />}

      {/* ===== Queue Sheets (列表) ===== */}
      {(["assess", "goal", "plan", "meeting", "rx", "monitor", "discharge"] as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="doctor">
          <TodoQueueList
            accent="doctor"
            items={QUEUES[k]}
            onPick={(item) => pickFromQueue(item, k as SheetKey)}
          />
        </PhoneSheet>
      ))}

      {/* ===== Single-patient confirmation sheets ===== */}
      <PhoneSheet open={sheet === "assess"} onClose={close} title={`首次康复评估${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={<PrimaryBtn variant="doctor" onClick={() => { toast.success("评估结果已确认"); close(); }}>确认评估结果</PrimaryBtn>}>
        <AssessSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title={`AI 康复目标${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <div className="flex gap-2">
            <button onClick={() => { toast("已切换到手动调整"); }} className="flex-1 border border-ai/30 text-ai rounded-2xl py-3 text-sm font-semibold">手动调整</button>
            <button onClick={() => { toast.success("康复目标已同步治疗师"); close(); }} className="flex-1 gradient-ai text-white rounded-2xl py-3 text-sm font-semibold">同步治疗师</button>
          </div>
        }>
        <GoalSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "plan"} onClose={close} title={`AI 康复方案${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("方案已提交团队会议确认"); close(); }}>提交团队会议</PrimaryBtn>}>
        <PlanSheet />
      </PhoneSheet>

      {/* === 团队会议 IM 聊天 === */}
      <PhoneSheet open={sheet === "meeting"} onClose={close} title="团队会议" accent="doctor" flush hideHeader>
        <IMChatSheet
          accent="doctor"
          title={`团队会议 · ${activePatient ? activePatient.split(" ")[0] : "张建国"}`}
          subtitle="V2 方案确认"
          participants={["李医师", "王治疗师", "陈治疗师", "赵护士", "孙博士"]}
          initialMessages={DEFAULT_MEETING_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          onClose={close}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "rx"} onClose={close} title={`确认 AI 处方${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={
          <div className="flex gap-2">
            <button onClick={() => toast("已驳回，待 AI 重新生成")} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">驳回</button>
            <button onClick={() => { toast.success("处方已确认 · 推送治疗师"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">确认 · 推送</button>
          </div>
        }>
        <RxSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "monitor"} onClose={close} title={`康复持续评估${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor">
        <MonitorSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "discharge"} onClose={close} title={`出院二级方案${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("二级方案已确认 · 转社区"); close(); }}>确认 · 转社区</PrimaryBtn>}>
        <DischargeSheet />
      </PhoneSheet>

      {/* === 线上会诊 IM 聊天 === */}
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

      <PhoneSheet open={sheet === "patient"} onClose={close} title="患者详情 · 张建国" accent="doctor">
        <PatientSheet onOpen={open} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "aiUpdate"} onClose={close} title="AI 智能更新方案" accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("已应用更新方案"); close(); }}>应用方案</PrimaryBtn>}>
        <AIUpdateSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "aiDischarge"} onClose={close} title="AI 二级方案预览" accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("已生成二级方案，去调整"); close(); }}>去调整确认</PrimaryBtn>}>
        <DischargeSheet />
      </PhoneSheet>

      {/* === 患者详情 / 备注 / 团队管理 === */}
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
  onOpenQueue,
  onGoPatients,
}: {
  onOpen: (k: SheetKey) => void;
  onOpenQueue: (k: QueueKey) => void;
  onGoPatients: () => void;
}) => {
  const tiles: { icon: any; label: string; color: string; k: QueueKey }[] = [
    { icon: ClipboardCheck, label: "首次评估", color: "text-primary bg-primary-soft", k: "assess" },
    { icon: Target, label: "康复目标", color: "text-secondary bg-secondary-soft", k: "goal" },
    { icon: FileText, label: "康复方案", color: "text-ai bg-ai-soft", k: "plan" },
    { icon: Users, label: "团队会议", color: "text-warning bg-warning-soft", k: "meeting" },
    { icon: Stethoscope, label: "康复处方", color: "text-success bg-success-soft", k: "rx" },
    { icon: Activity, label: "持续评估", color: "text-primary bg-primary-soft", k: "monitor" },
    { icon: TrendingUp, label: "出院方案", color: "text-secondary bg-secondary-soft", k: "discharge" },
  ];
  return (
    <div className="pb-4">
      <div className="gradient-doctor px-5 pt-2 pb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">早上好</div>
            <div className="text-xl font-bold mt-0.5">李医师 👋</div>
          </div>
          <button onClick={() => toast("您有 3 条新提醒")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>

        <div className="relative mt-5">
          <PendingStatRow
            items={[
              { label: "待首次评估", count: QUEUES.assess.length, onClick: () => onOpenQueue("assess") },
              { label: "待确认方案", count: QUEUES.plan.length, onClick: () => onOpenQueue("plan") },
              { label: "待确认处方", count: QUEUES.rx.length, onClick: () => onOpenQueue("rx") },
            ]}
          />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* 新患者提醒 */}
        {NEW_PATIENT_COUNT > 0 && (
          <button
            onClick={onGoPatients}
            className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3 border-l-4 border-l-warning active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">有 {NEW_PATIENT_COUNT} 位新患者待接入</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">点击进入患者管理 · 安排首次评估</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <div>
          <SectionTitle title="医师工作台 · 点击查看待办列表" />
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
            <WorkbenchTile
              icon={Video}
              label="线上会诊"
              color="text-ai bg-ai-soft"
              onClick={() => onOpen("video")}
            />
            <WorkbenchTile
              icon={UsersRound}
              label="患者管理"
              color="text-role-doctor bg-primary-soft"
              count={NEW_PATIENT_COUNT}
              onClick={onGoPatients}
            />
          </div>
        </div>

        <div>
          <SectionTitle
            title="今日紧急待办"
            extra={
              <button onClick={() => onOpenQueue("plan")} className="text-xs text-primary font-medium flex items-center">
                全部 <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="space-y-2">
            <PatientTaskCard onClick={() => onOpenQueue("plan")} patient="待确认 AI 方案" tag={`共 ${QUEUES.plan.length} 位患者`} task="点击进入方案确认列表，逐位审核" urgency="high" time="10:30 团队会议" />
            <PatientTaskCard onClick={() => onOpenQueue("assess")} patient="待首次评估" tag={`共 ${QUEUES.assess.length} 位患者`} task="团队线上接入 · 进入评估列表" urgency="medium" time="今日" />
            <PatientTaskCard onClick={() => onOpenQueue("discharge")} patient="待生成出院方案" tag={`共 ${QUEUES.discharge.length} 位患者`} task="AI 二级方案待调整确认" urgency="low" time="今日" />
          </div>
        </div>

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
                  <div className="w-full rounded-t-md gradient-doctor opacity-90" style={{ height: `${h}%` }} />
                  <span className="text-[9px] text-muted-foreground">{["一", "二", "三", "四", "五", "六", "日"][i]}</span>
                </div>
              ))}
            </div>
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
        <span className="text-[11px] text-primary font-semibold flex items-center">查看列表 <ChevronRight className="w-3 h-3" /></span>
      </div>
    </button>
  );
};

const DoctorTasks = ({
  onOpen,
  onOpenQueue,
}: {
  onOpen: (k: SheetKey) => void;
  onOpenQueue: (k: QueueKey) => void;
}) => {
  const queues: { k: QueueKey; label: string; desc: string; icon: any; color: string }[] = [
    { k: "assess", label: "首次评估", desc: "团队线上协同", icon: ClipboardCheck, color: "bg-primary-soft text-primary" },
    { k: "goal", label: "康复目标确认", desc: "AI 智能 / 手动", icon: Target, color: "bg-secondary-soft text-secondary" },
    { k: "plan", label: "康复方案确认", desc: "AI 生成 V2", icon: FileText, color: "bg-ai-soft text-ai" },
    { k: "meeting", label: "团队会议", desc: "线上多角色", icon: Users, color: "bg-warning-soft text-warning" },
    { k: "rx", label: "AI 处方建议", desc: "确认后推送治疗师", icon: Stethoscope, color: "bg-success-soft text-success" },
    { k: "monitor", label: "持续评估", desc: "进行中患者", icon: Activity, color: "bg-primary-soft text-primary" },
    { k: "discharge", label: "出院二级方案", desc: "AI 生成调整", icon: TrendingUp, color: "bg-secondary-soft text-secondary" },
  ];
  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="text-xl font-bold mb-1">待办分类</h2>
      <p className="text-xs text-muted-foreground mb-4">按事项类型查看患者列表，逐位确认</p>

      <div className="space-y-2">
        {queues.map((q) => {
          const Icon = q.icon;
          const count = QUEUES[q.k].length;
          return (
            <button
              key={q.k}
              onClick={() => onOpenQueue(q.k)}
              className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3 active:scale-[0.99]"
            >
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

const DoctorAI = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => {
  const [input, setInput] = useState("");
  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <div className="rounded-2xl p-5 gradient-ai text-white relative overflow-hidden">
        <Sparkles className="absolute top-3 right-3 w-16 h-16 opacity-20" />
        <div className="text-xs opacity-80">康复智能体</div>
        <div className="text-2xl font-bold mt-1">RehabGPT 4.0</div>
        <div className="text-xs opacity-90 mt-2">基于 12,000+ 真实病例训练</div>
      </div>

      <AICard title="AI 智能更新方案" action={<button onClick={() => onOpen("aiUpdate")} className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold">查看 / 应用</button>}>
        根据张建国近 7 日评估数据，建议提升下肢 PT 训练强度 20%，增加平衡训练 2 次/日。
      </AICard>

      <AICard title="AI 二级方案（院外）" action={<button onClick={() => onOpen("aiDischarge")} className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold">预览 / 调整</button>}>
        检测到患者满足出院条件。已生成包含家庭训练计划、远程随访周期与紧急情况预警的院外方案。
      </AICard>

      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="text-sm font-semibold mb-3">与 AI 对话</div>
        <div className="space-y-2 mb-3">
          <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 text-xs max-w-[85%]">这位患者的肌张力如何调整？</div>
          <div className="bg-ai-soft rounded-xl rounded-tr-sm px-3 py-2 text-xs ml-auto max-w-[85%] border border-ai/20">建议先评估 MAS 分级，若 ≥ 2 级可联合 BTX-A 注射 + 牵伸训练。已生成详细处方草案。</div>
        </div>
        <div className="flex gap-2 items-center bg-muted rounded-full px-3 py-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="向 AI 提问..." className="flex-1 bg-transparent text-xs outline-none" />
          <button onClick={() => { if (input.trim()) { toast.success("AI 已收到问题"); setInput(""); } }} className="w-7 h-7 rounded-full gradient-ai flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorMe = () => (
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
      {["我的患者", "评估记录", "团队管理", "AI 偏好设置", "帮助与反馈"].map((it) => (
        <button key={it} onClick={() => toast(it + " · 即将开放")} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===================== Sheets ===================== */

const AssessSheet = ({ patient }: { patient?: string }) => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold mb-1">{patient || "王秀英 · 女 68 岁"}</div>
      <div className="text-[11px] text-muted-foreground">康复评估准备就绪</div>
    </div>
    <AICard title="AI 风险与病史智能分析">
      检测：跌倒高风险 ★★★ · 深静脉血栓中风险 ★★ · 疼痛评分 6/10。建议优先评估关节 ROM 与负重耐受。
    </AICard>
    <SectionTitle title="评估量表（团队线上协同）" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="Harris 髋关节评分" value="待录入" hint="负责：王治疗师" />
      <FormRow label="VAS 疼痛评分" value="6 / 10" hint="负责：赵护士 · 已完成" />
      <FormRow label="Berg 平衡量表" value="32 分" hint="负责：王治疗师 · 已完成" />
      <FormRow label="Barthel 指数" value="待录入" hint="负责：李医师" />
    </div>
    <AICard title="AI 评估结果初判" action={
      <div className="flex gap-2">
        <button className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold" onClick={() => toast("已发起再次线上评估")}>结果不确定 · 再评估</button>
      </div>
    }>
      综合判定：康复潜力良好，建议进入"目标设定 → 方案制定"环节。
    </AICard>
  </div>
);

const GoalSheet = () => (
  <div className="p-4 space-y-3">
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

const PlanSheet = () => (
  <div className="p-4 space-y-3">
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

const MeetingSheet = () => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold">线上团队会议 · 10:30</div>
      <div className="text-[11px] text-muted-foreground mt-1">议题：张建国 V2 方案确认</div>
    </div>
    <SectionTitle title="参会成员" />
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2">
      {[
        { name: "李志远 主任医师", role: "康复医师", status: "已到" },
        { name: "王雅琴 治疗师", role: "PT/OT", status: "已到" },
        { name: "陈思雨 治疗师", role: "ST", status: "已到" },
        { name: "赵静怡 主管护师", role: "护理", status: "已到" },
        { name: "孙博士", role: "心理", status: "待入" },
      ].map((m) => (
        <div key={m.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full gradient-doctor text-white flex items-center justify-center text-xs font-bold">{m.name[0]}</div>
            <div>
              <div className="text-[12px] font-semibold">{m.name}</div>
              <div className="text-[10px] text-muted-foreground">{m.role}</div>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.status === "已到" ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}>{m.status}</span>
        </div>
      ))}
    </div>
    <AICard title="AI 会议纪要草稿（实时生成）">
      已记录 3 条讨论要点。建议在通过后由 AI 自动生成处方推送至治疗师。
    </AICard>
  </div>
);

const RxSheet = () => (
  <div className="p-4 space-y-3">
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

const MonitorSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="AI 持续评估提示">
      患者 FMA 周提升 +8，符合预期。Barthel 已达 70，距离出院标准（≥75）还差 5 分。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold mb-3">关键指标趋势 · 近 14 天</div>
      <div className="space-y-3">
        {[{ name: "FMA", v: 65 }, { name: "Barthel", v: 78 }, { name: "Berg", v: 60 }, { name: "VAS 疼痛", v: 30 }].map((m) => (
          <div key={m.name}>
            <div className="flex justify-between text-[11px] mb-1"><span>{m.name}</span><span className="text-foreground/60">{m.v}%</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full gradient-doctor" style={{ width: `${m.v}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
    <SectionTitle title="出院条件检查" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="独立步行 ≥ 50m" value={<CheckCircle2 className="w-4 h-4 text-success" />} />
      <FormRow label="Barthel ≥ 75" value={<span className="text-warning text-xs font-semibold">差 5 分</span>} />
      <FormRow label="家属照护培训完成" value={<CheckCircle2 className="w-4 h-4 text-success" />} />
      <FormRow label="无急性并发症" value={<CheckCircle2 className="w-4 h-4 text-success" />} />
    </div>
  </div>
);

const DischargeSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="AI 生成的院外二级方案">
      包含：家庭训练计划、远程随访周期、紧急情况预警、社区康复对接。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="家庭训练" value="每日 60 min" hint="PT 视频指导 × 3 节" />
      <FormRow label="远程随访" value="每周 1 次" hint="医师视频回访 + 量表" />
      <FormRow label="紧急预警" value="跌倒 / 疼痛突增" hint="自动通知医师 + 家属" />
      <FormRow label="社区对接" value="徐汇康复站" hint="每周 2 次门诊治疗" />
      <FormRow label="复诊节点" value="2 / 4 / 8 周" />
    </div>
  </div>
);

const VideoSheet = () => (
  <div className="p-4 space-y-3">
    <div className="rounded-2xl gradient-doctor text-white p-6 text-center">
      <Video className="w-12 h-12 mx-auto mb-3" />
      <div className="text-base font-bold">线上团队会诊</div>
      <div className="text-xs opacity-90 mt-1">一键邀请治疗师 / 护士 / 心理</div>
    </div>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="选择患者" value="张建国 ▾" />
      <FormRow label="会诊议题" value="V2 方案确认 ▾" />
      <FormRow label="预定时间" value="今日 10:30 ▾" />
      <FormRow label="参会人" value="5 人已选" />
    </div>
  </div>
);

const PatientSheet = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold">张</div>
        <div className="flex-1">
          <div className="text-sm font-bold">张建国 · 男 56 岁</div>
          <div className="text-[11px] text-muted-foreground">床号 305 · 入院第 12 天</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-warning-soft text-warning font-semibold">康复中</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatChip label="FMA" value="42" accent="primary" />
        <StatChip label="Barthel" value="70" accent="success" />
        <StatChip label="VAS" value="3" accent="warning" />
      </div>
    </div>
    <SectionTitle title="快速操作" />
    <div className="grid grid-cols-3 gap-2">
      {[
        { l: "更新评估", k: "monitor" as SheetKey, i: Activity },
        { l: "调整目标", k: "goal" as SheetKey, i: Target },
        { l: "更新方案", k: "plan" as SheetKey, i: FileText },
        { l: "确认处方", k: "rx" as SheetKey, i: Stethoscope },
        { l: "团队会议", k: "meeting" as SheetKey, i: Users },
        { l: "出院方案", k: "discharge" as SheetKey, i: HomeIcon },
      ].map((it) => (
        <button key={it.l} onClick={() => onOpen(it.k)} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card">
          <it.i className="w-5 h-5 text-primary" />
          <span className="text-[11px] font-medium">{it.l}</span>
        </button>
      ))}
    </div>
  </div>
);

const AIUpdateSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="AI 智能更新方案 · 张建国">
      检测到 FMA +8，建议下肢 PT 强度 +20%，新增平衡训练 2 次/日，OT 增加厨房训练。
    </AICard>
    <SectionTitle title="变更项" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="PT 总时长" value={<span><span className="line-through text-muted-foreground">50</span> → <b className="text-success">60</b> min</span>} />
      <FormRow label="平衡训练频率" value={<span><span className="line-through text-muted-foreground">1</span> → <b className="text-success">2</b> 次/日</span>} />
      <FormRow label="OT 厨房" value={<span className="text-success font-semibold">新增</span>} />
      <FormRow label="ST" value="保持不变" />
    </div>
  </div>
);
