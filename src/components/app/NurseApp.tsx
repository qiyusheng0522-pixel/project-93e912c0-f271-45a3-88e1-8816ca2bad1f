import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, PendingTodoGrid, TodoItem } from "@/components/app/TodoQueue";
import {
  PatientsPage,
  PatientDetailSheet,
  AddNoteSheet,
  TeamManageSheet,
  PatientChatListSheet,
  PatientChatSheet,
  Patient,
  PATIENTS,
  NEW_PATIENT_COUNT,
  PATIENT_UNREAD,
} from "@/components/app/PatientsModule";
import {
  Home as HomeIcon,
  UsersRound,
  BookOpen,
  MessageCircle,
  User as UserIcon,
  Bell,
  ChevronRight,
  Pill,
  HeartPulse,
  CheckCircle2,
  Syringe,
  Activity,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MeStats } from "@/components/app/MeStats";

const NURSE_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: HomeIcon },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "edu", label: "宣教", icon: BookOpen },
  { key: "chat", label: "患者沟通", icon: MessageCircle, badge: PATIENT_UNREAD },
  { key: "me", label: "我的", icon: UserIcon },
];

type SheetKey =
  | null
  | "med"
  | "vitals"
  | "inject"
  | "obs"
  | "execTask"
  | "patientDetail"
  | "addNote"
  | "team"
  | "patientChat"
  | "eduPush"
  | "dailyNote";

type QueueKey = "med" | "vitals" | "inject" | "obs" | "execTask";

const QUEUE_TITLE: Record<QueueKey, string> = {
  med: "待执行给药",
  vitals: "待测生命体征",
  inject: "待执行注射",
  obs: "待病情观察",
  execTask: "待执行护理任务",
};

// 根据康复处方生成的待办（按患者维度）
const QUEUES: Record<QueueKey, TodoItem[]> = {
  med: [
    { id: "m1", patient: "303 张建国", meta: "阿司匹林 100mg · IV", detail: "处方关联：脑卒中后偏瘫", time: "14:00", urgency: "high" },
    { id: "m2", patient: "310 陈丽华", meta: "多奈哌齐 5mg · po", detail: "处方关联：认知障碍", time: "15:30", urgency: "medium" },
    { id: "m3", patient: "305 王秀英", meta: "塞来昔布 200mg · po", detail: "处方关联：髋关节术后", time: "16:00", urgency: "medium" },
    { id: "m4", patient: "307 李 强", meta: "巴氯芬 10mg · po", detail: "处方关联：脊髓损伤", time: "21:00", urgency: "low" },
  ],
  vitals: [
    { id: "v1", patient: "305 王秀英", meta: "血压 + 心率", detail: "VS q4h · 第 3 次", time: "14:30", urgency: "medium" },
    { id: "v2", patient: "303 张建国", meta: "血压 + 心率 + 血氧", detail: "VS q6h", time: "15:00", urgency: "medium" },
  ],
  inject: [
    { id: "in1", patient: "305 王秀英", meta: "低分子肝素 0.4ml ih", detail: "腹部皮下", time: "14:35", urgency: "medium" },
  ],
  obs: [
    { id: "o1", patient: "303 张建国", meta: "夜间血压波动", detail: "AI 提示加强观察", urgency: "high" },
    { id: "o2", patient: "307 李 强", meta: "压疮高风险监测", detail: "Braden 14 分", urgency: "medium" },
  ],
  execTask: [
    { id: "et1", patient: "312 刘伟明", meta: "伤口换药", detail: "术后第 5 天", time: "16:00", urgency: "high" },
    { id: "et2", patient: "303 张建国", meta: "翻身 + 拍背", detail: "q2h", time: "15:00", urgency: "medium" },
    { id: "et3", patient: "307 李 强", meta: "导尿管护理", detail: "每日清洁", time: "17:00", urgency: "medium" },
  ],
};

export const NurseApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [queue, setQueue] = useState<QueueKey | null>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const [pickedPatient, setPickedPatient] = useState<Patient | null>(null);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
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

  const queueToSheet: Record<QueueKey, SheetKey> = {
    med: "med",
    vitals: "vitals",
    inject: "inject",
    obs: "obs",
    execTask: "execTask",
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="nurse" newPatientCount={NEW_PATIENT_COUNT} items={NURSE_TABS} />}>
      {tab === "home" && (
        <NurseHome
          onOpenQueue={openQueue}
          onOpenDailyNote={() => open("dailyNote")}
          onOpenEdu={() => setTab("edu")}
        />
      )}
      {tab === "patients" && <PatientsPage accent="nurse" onPick={pickPatient} />}
      {tab === "edu" && <EduPage onOpenPush={() => open("eduPush")} />}
      {tab === "chat" && <PatientChatListSheet accent="nurse" onPick={(p) => { setChatPatient(p); setSheet("patientChat"); }} />}
      {tab === "me" && <Me onOpenTeam={() => open("team")} />}

      {(["med", "vitals", "inject", "obs", "execTask"] as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="nurse">
          <TodoQueueList accent="nurse" items={QUEUES[k]} onPick={(item) => pickFromQueue(item, queueToSheet[k])} />
        </PhoneSheet>
      ))}

      <PhoneSheet open={sheet === "med"} onClose={close} title={`给药操作${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("给药完成 · 已自动生成执行记录"); close(); }}>确认给药完成</PrimaryBtn>}>
        <MedExecSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "vitals"} onClose={close} title={`生命体征录入${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("生命体征已保存 · 已同步医师端"); close(); }}>保存</PrimaryBtn>}>
        <VitalsSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "inject"} onClose={close} title={`注射记录${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("注射记录已保存"); close(); }}>保存记录</PrimaryBtn>}>
        <InjectSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "obs"} onClose={close} title={`病情观察${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("观察记录已上传医师端"); close(); }}>上报观察</PrimaryBtn>}>
        <ObsSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "execTask"} onClose={close} title={`执行护理任务${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("任务已完成 · 已记录"); close(); }}>完成任务</PrimaryBtn>}>
        <ExecTaskSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "dailyNote"} onClose={close} title="每日康复护理备注" accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("护理备注已保存到患者档案"); close(); }}>保存到患者档案</PrimaryBtn>}>
        <DailyNoteSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "eduPush"} onClose={close} title="多患者宣教推送" accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("宣教内容已推送选中患者及家属"); close(); }}>一键推送</PrimaryBtn>}>
        <EduPushSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientDetail"} onClose={close} title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`} accent="nurse">
        <PatientDetailSheet
          patient={pickedPatient}
          accent="nurse"
          onAddNote={() => setSheet("addNote")}
          actions={[
            { key: "med", label: "给药", icon: Pill, onClick: () => { setActivePatient(pickedPatient ? `${pickedPatient.bed} ${pickedPatient.name}` : ""); setSheet("med"); } },
            { key: "care", label: "护理记录", icon: ClipboardCheck, onClick: () => setSheet("dailyNote") },
            { key: "note", label: "备注", icon: Activity, onClick: () => setSheet("addNote") },
          ]}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "addNote"} onClose={() => setSheet("patientDetail")} title="添加护理备注" accent="nurse">
        <AddNoteSheet
          patient={pickedPatient}
          accent="nurse"
          onSave={(text) => {
            if (!pickedPatient) return;
            const newNote = { author: "赵护士", time: "刚刚", text };
            const updated = [newNote, ...(patientNotes[pickedPatient.id] ?? pickedPatient.notes)];
            setPatientNotes({ ...patientNotes, [pickedPatient.id]: updated });
            setPickedPatient({ ...pickedPatient, notes: updated });
            toast.success("备注已保存并共享给团队");
            setSheet("patientDetail");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "team"} onClose={close} title="团队管理" accent="nurse">
        <TeamManageSheet accent="nurse" />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChat"} onClose={close} title="患者沟通" accent="nurse" flush hideHeader>
        <PatientChatSheet accent="nurse" patient={chatPatient} onClose={close} />
      </PhoneSheet>
    </ScreenShell>
  );
};

/* ============== 工作台首页：根据康复处方生成的不同患者待办列 ============== */
const NurseHome = ({
  onOpenQueue,
  onOpenDailyNote,
  onOpenEdu,
}: {
  onOpenQueue: (k: QueueKey) => void;
  onOpenDailyNote: () => void;
  onOpenEdu: () => void;
}) => {
  const totalTodo = QUEUES.med.length + QUEUES.vitals.length + QUEUES.inject.length + QUEUES.obs.length + QUEUES.execTask.length;
  const allTodos: { patient: string; meta: string; time?: string; urgency: "high" | "medium" | "low"; k: QueueKey }[] = [
    ...QUEUES.med.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "med" as QueueKey })),
    ...QUEUES.execTask.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "execTask" as QueueKey })),
    ...QUEUES.vitals.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "vitals" as QueueKey })),
    ...QUEUES.obs.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "obs" as QueueKey })),
  ].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.urgency] - { high: 0, medium: 1, low: 2 }[b.urgency]));

  return (
    <div className="pb-4">
      <div className="bg-background px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">您好</div>
            <div className="text-xl font-bold mt-0.5 text-foreground">赵护士 👋</div>
            <div className="text-[11px] text-muted-foreground mt-1">今日共 {totalTodo} 项护理待办（来自康复处方）</div>
          </div>
          <button onClick={() => toast("您有 4 条新任务")} className="w-9 h-9 rounded-full bg-rose-50 text-role-nurse flex items-center justify-center relative">
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
            { label: "待护理", count: QUEUES.execTask.length, icon: HeartPulse, iconClass: "bg-success text-white", onClick: () => onOpenQueue("execTask") },
            { label: "待记录", count: QUEUES.vitals.length, icon: Activity, iconClass: "bg-primary text-white", onClick: () => onOpenQueue("vitals") },
            { label: "待宣教", count: 3, icon: BookOpen, iconClass: "bg-warning text-white", onClick: onOpenEdu },
            { label: "待回复消息", count: PATIENT_UNREAD, icon: MessageCircle, iconClass: "bg-secondary text-white", onClick: () => toast("进入患者沟通") },
          ]}
        />
      </div>
    </div>
  );
};

/* ============== 宣教中心页 ============== */
const EduPage = ({ onOpenPush }: { onOpenPush: () => void }) => (
  <div className="pb-4">
    <div className="gradient-nurse px-5 pt-6 pb-6 text-white">
      <div className="text-xs opacity-80">康复宣教中心</div>
      <div className="text-[15px] font-semibold mt-0.5">按康复阶段推送 · 单 / 多患者</div>
    </div>
    <div className="px-4 pt-4 space-y-3">
      <button onClick={onOpenPush} className="w-full gradient-nurse text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-card">
        <Send className="w-4 h-4" /> 多患者宣教推送
      </button>
      <AICard title="AI 智能推荐宣教内容">基于患者康复阶段（术后早期 / 中期 / 出院前）自动匹配最适合的宣教素材。</AICard>
      <SectionTitle title="按阶段分类" />
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: "术后早期", desc: "0-7 天", count: 8 },
          { title: "康复中期", desc: "8-21 天", count: 14 },
          { title: "出院前", desc: "22+ 天", count: 9 },
          { title: "家属篇", desc: "全阶段", count: 6 },
        ].map(c => (
          <button key={c.title} onClick={onOpenPush} className="bg-card rounded-2xl shadow-card p-4 text-left active:scale-[0.99]">
            <div className="text-sm font-bold">{c.title}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{c.desc} · {c.count} 个素材</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const EduPushSheet = () => {
  const [selected, setSelected] = useState<string[]>([PATIENTS[2].id, PATIENTS[3].id]);
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div className="p-4 space-y-3">
      <AICard title="AI 推荐推送对象">
        系统已根据康复阶段自动勾选 2 位最适合接收「术后家庭防护」宣教的患者，可手动调整。
      </AICard>
      <SectionTitle title="选择宣教素材" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="素材" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>术后家庭防护</option><option>吞咽训练</option><option>用药安全</option></select>} />
        <FormRow label="格式" value={<span className="text-[11px]">视频 + 图文 + 测验</span>} />
      </div>
      <SectionTitle title={`选择推送患者 · 已选 ${selected.length}`} extra={<button onClick={() => setSelected(PATIENTS.map(p => p.id))} className="text-[11px] text-role-nurse font-semibold">全选</button>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {PATIENTS.map(p => (
          <button key={p.id} onClick={() => toggle(p.id)} className="w-full flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-nurse text-white flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
              <div className="text-left">
                <div className="text-[12px] font-semibold">{p.name} · 床{p.bed}</div>
                <div className="text-[10px] text-muted-foreground">{p.condition} · 入院 {p.admitDays} 天</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selected.includes(p.id) ? "bg-role-nurse border-role-nurse text-white" : "border-border"}`}>
              {selected.includes(p.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const DailyNoteSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="每日康复护理备注">
      记录今日护理观察、给药执行、患者反馈等，提交后写入对应患者档案。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value={<select className="bg-muted rounded px-2 py-1 text-xs">{PATIENTS.map(p => <option key={p.id}>{p.name} · 床{p.bed}</option>)}</select>} />
      <FormRow label="班次" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>白班</option><option>夜班</option></select>} />
    </div>
    <textarea
      defaultValue="患者今日精神可，配合度高；伤口干洁；夜间睡眠 6h，无诉不适。给药全部执行到位。"
      className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-32 outline-none"
    />
  </div>
);

/* ===================== Sheets ===================== */

const MedExecSheet = ({ patient }: { patient?: string }) => (
  <div className="p-4 space-y-3">
    <div className="rounded-2xl gradient-nurse text-white p-5">
      <div className="text-xs opacity-80">给药任务</div>
      <div className="text-xl font-bold mt-1">{patient || "303 床 · 张建国"}</div>
      <div className="text-xs opacity-90 mt-2">阿司匹林 100mg · 静脉注射 · 14:00</div>
    </div>
    <AICard title="AI 用药安全核对">未检测到药物相互作用风险。患者无 NSAIDs 过敏史。</AICard>
    <SectionTitle title="三查七对" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["患者姓名 · 张建国", "床号 · 303", "药物 · 阿司匹林 100mg", "剂量 · 100mg", "给药时间 · 14:00", "给药途径 · IV", "有效期 · 2026-12"].map((c) => (
        <div key={c} className="flex items-center justify-between py-3">
          <span className="text-[12px]">{c}</span>
          <CheckCircle2 className="w-4 h-4 text-success" />
        </div>
      ))}
    </div>
    <div className="bg-warning-soft text-warning rounded-2xl p-3 text-xs flex items-center gap-2">
      <ShieldCheck className="w-4 h-4" /> 需双人核对，请同事扫码确认
    </div>
  </div>
);

const VitalsSheet = ({ patient }: { patient?: string }) => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold">{patient || "305 床 · 王秀英"}</div>
      <div className="text-[11px] text-muted-foreground">14:30 测量</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { l: "体温 ℃", d: "36.7" }, { l: "脉搏 bpm", d: "78" }, { l: "呼吸 /min", d: "18" },
        { l: "血压 mmHg", d: "128/82" }, { l: "血氧 %", d: "98" }, { l: "疼痛 VAS", d: "3" },
      ].map((v) => (
        <div key={v.l} className="bg-card rounded-2xl shadow-card p-3">
          <div className="text-[10px] text-muted-foreground">{v.l}</div>
          <input defaultValue={v.d} className="w-full mt-1 bg-transparent text-lg font-bold outline-none" />
        </div>
      ))}
    </div>
    <AICard title="AI 异常筛查">所有指标在正常范围内。</AICard>
  </div>
);

const InjectSheet = () => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value="305 王秀英 ▾" />
      <FormRow label="药物" value="低分子肝素 ▾" />
      <FormRow label="部位" value="腹部皮下 ▾" />
      <FormRow label="剂量" value={<input defaultValue="0.4ml" className="w-20 bg-muted rounded px-2 py-1 text-xs text-right" />} />
      <FormRow label="时间" value="14:35" />
    </div>
  </div>
);

const ObsSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="AI 异常监测提示">检测到患者夜间血压波动较大，建议加强观察。</AICard>
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2">
      <div className="text-[11px] text-muted-foreground">观察记录</div>
      <textarea defaultValue="患者意识清楚，对答切题。下肢肌力 III 级，无新发疼痛。皮肤完好，无压疮。" className="w-full bg-muted rounded-xl p-3 text-xs h-32 outline-none" />
    </div>
    <SectionTitle title="风险评估" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="跌倒风险" value="中 ▾" />
      <FormRow label="压疮风险" value="低 ▾" />
      <FormRow label="DVT 风险" value="中 ▾" />
    </div>
  </div>
);

const ExecTaskSheet = () => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold">312 床 · 刘伟明</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">伤口换药 · 术后第 5 天</div>
    </div>
    <SectionTitle title="操作步骤" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["手卫生 + 戴手套", "评估伤口情况", "去除旧敷料", "消毒伤口", "更换敷料", "记录伤口情况"].map((s, i) => (
        <FormRow key={s} label={`${i + 1}. ${s}`} value={<input type="checkbox" className="w-4 h-4 accent-pink-500" />} />
      ))}
    </div>
  </div>
);

const Me = ({ onOpenTeam }: { onOpenTeam: () => void }) => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-nurse flex items-center justify-center text-white text-xl font-bold">赵</div>
      <div>
        <div className="text-base font-bold">赵静怡 主管护师</div>
        <div className="text-xs text-muted-foreground mt-0.5">康复护理组 · 12 年</div>
      </div>
    </div>

    <MeStats
      accent="nurse"
      tiles={[
        { label: "本月护理", value: 412, sub: "次" },
        { label: "给药执行", value: 286, sub: "项" },
        { label: "宣教推送", value: 64, sub: "次" },
      ]}
      trend={[
        { day: "一", value: 18 }, { day: "二", value: 22 }, { day: "三", value: 17 },
        { day: "四", value: 25 }, { day: "五", value: 21 }, { day: "六", value: 12 }, { day: "日", value: 9 },
      ]}
      revenue={{
        monthLabel: "本月收益",
        monthValue: "12,860",
        today: "520",
        pending: "1,640",
        breakdown: [
          { label: "护理操作", value: "7,200" },
          { label: "给药执行", value: "3,800" },
          { label: "宣教 / 随访", value: "1,860" },
        ],
      }}
    />

    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-nurse" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      {["护理记录", "给药历史", "宣教记录", "排班", "设置"].map((it) => (
        <button key={it} onClick={() => toast(it + " · 即将开放")} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);
