import { useState } from "react";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { AICard, SectionTitle } from "@/components/app/UI";
import {
  ChevronRight,
  Search,
  Plus,
  Send,
  Sparkles,
  Bell,
  UserPlus,
  Users,
  MessageSquare,
  StickyNote,
  Share2,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export type Accent = "doctor" | "therapist" | "nurse";

export type PatientFilter =
  | "all"
  | "新患者"
  | "待首次评估"
  | "康复中"
  | "待出院"
  | "已出院";

export type Patient = {
  id: string;
  name: string;
  bed: string;
  meta: string;
  status: "新患者" | "康复中" | "待出院" | "已出院";
  condition: string; // 病症 用于筛选
  admitDays: number; // 入院天数
  needFirstAssess?: boolean; // 是否待首次评估
  shared: string[];
  notes: { author: string; time: string; text: string }[];
  isNew?: boolean;
  therapyRecords?: { type: "PT" | "OT" | "ST"; author: string; time: string; text: string }[];
  summaries?: { author: string; time: string; text: string }[];
  medChanges?: { author: string; time: string; text: string }[];
  checkins?: { time: string; task: string; author: string }[];
};

export const PATIENTS: Patient[] = [
  { id: "p0", name: "孙德强", bed: "315", meta: "男 60 · 膝关节置换术后 · 今日入院", status: "新患者", condition: "膝关节置换", admitDays: 0, needFirstAssess: true, shared: ["李医师", "王治疗师", "赵护士"], notes: [], isNew: true },
  { id: "p9", name: "吴丽君", bed: "316", meta: "女 55 · 颅脑外伤 · 今日入院", status: "新患者", condition: "颅脑外伤", admitDays: 0, needFirstAssess: true, shared: ["李医师"], notes: [], isNew: true },
  { id: "p1", name: "张建国", bed: "303", meta: "男 56 · 脑卒中后偏瘫 · 入院第 12 天", status: "康复中", condition: "脑卒中", admitDays: 12, shared: ["李医师", "王治疗师", "陈治疗师", "赵护士"],
    notes: [
      { author: "李医师", time: "今日 09:20", text: "FMA 提升明显，下周复评后可考虑加强 OT 训练。" },
      { author: "王治疗师", time: "昨日 16:40", text: "步态稳定性进步，建议加入双任务训练。" },
    ],
    therapyRecords: [
      { type: "PT", author: "王治疗师", time: "今日 09:30", text: "步态训练 30min · 患者步频提高 8%，重心转移好。" },
      { type: "OT", author: "陈治疗师", time: "今日 11:00", text: "ADL 穿衣训练 20min · 上肢动作流畅度改善。" },
    ],
    summaries: [
      { author: "王治疗师", time: "昨日 17:30", text: "完成 PT/OT 5/5 项，Borg 9，建议明日加入双任务训练。" },
    ],
    medChanges: [
      { author: "王治疗师", time: "昨日 14:00", text: "建议医师评估巴氯芬剂量：肌张力 MAS 1+ → 1。" },
    ],
    checkins: [
      { time: "今日 09:15", task: "PT 步态训练", author: "系统自动 · 任务执行" },
      { time: "今日 11:00", task: "OT ADL 训练", author: "系统自动 · 任务执行" },
    ],
  },
  { id: "p2", name: "王秀英", bed: "305", meta: "女 68 · 髋关节置换术后第 5 天", status: "康复中", condition: "髋关节置换", admitDays: 5, needFirstAssess: true, shared: ["李医师", "王治疗师", "赵护士"], notes: [
    { author: "赵护士", time: "今日 11:00", text: "夜间疼痛缓解，VAS 由 6 降至 3。" },
  ] },
  { id: "p3", name: "李 强", bed: "307", meta: "男 42 · 脊髓损伤 · 入院第 28 天", status: "待出院", condition: "脊髓损伤", admitDays: 28, shared: ["李医师", "王治疗师", "赵护士"], notes: [] },
  { id: "p4", name: "陈丽华", bed: "310", meta: "女 65 · 认知障碍", status: "康复中", condition: "认知障碍", admitDays: 18, shared: ["李医师", "陈治疗师"], notes: [] },
  { id: "p5", name: "周建华", bed: "311", meta: "男 72 · 脑梗死恢复期", status: "康复中", condition: "脑梗死", admitDays: 2, needFirstAssess: true, shared: ["李医师", "王治疗师"], notes: [] },
];

export const NEW_PATIENT_COUNT = PATIENTS.filter(p => p.isNew).length;
export const FIRST_ASSESS_COUNT = PATIENTS.filter(p => p.needFirstAssess).length;
export const ALL_CONDITIONS = Array.from(new Set(PATIENTS.map(p => p.condition)));

const accentBg: Record<Accent, string> = {
  doctor: "gradient-doctor",
  therapist: "gradient-therapist",
  nurse: "gradient-nurse",
};
const accentText: Record<Accent, string> = {
  doctor: "text-role-doctor",
  therapist: "text-role-therapist",
  nurse: "text-role-nurse",
};

/* ============== 患者管理主页 ============== */
export const PatientsPage = ({
  accent,
  onPick,
  initialFilter = "all",
}: {
  accent: Accent;
  onPick: (p: Patient) => void;
  initialFilter?: PatientFilter;
}) => {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientFilter>(initialFilter);
  const [condition, setCondition] = useState<string>("");
  const [admitRange, setAdmitRange] = useState<"all" | "0-3" | "4-14" | "15+">("all");

  const matchStatus = (p: Patient) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "待首次评估") return p.needFirstAssess;
    if (statusFilter === "新患者") return p.isNew;
    return p.status === statusFilter;
  };
  const matchAdmit = (p: Patient) => {
    if (admitRange === "all") return true;
    if (admitRange === "0-3") return p.admitDays <= 3;
    if (admitRange === "4-14") return p.admitDays >= 4 && p.admitDays <= 14;
    return p.admitDays >= 15;
  };
  const list = PATIENTS.filter(p =>
    (p.name.includes(q) || p.bed.includes(q)) &&
    matchStatus(p) &&
    (!condition || p.condition === condition) &&
    matchAdmit(p)
  );

  const filterChips: { key: PatientFilter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: PATIENTS.length },
    { key: "待首次评估", label: "待首次评估", count: PATIENTS.filter(p => p.needFirstAssess).length },
    { key: "新患者", label: "新患者", count: NEW_PATIENT_COUNT },
    { key: "康复中", label: "康复中", count: PATIENTS.filter(p => p.status === "康复中").length },
    { key: "待出院", label: "待出院", count: PATIENTS.filter(p => p.status === "待出院").length },
  ];

  return (
    <div className="pb-4">
      <div className={`${accentBg[accent]} px-5 pt-2 pb-6 text-white relative overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">患者管理</div>
              <div className="text-lg font-semibold mt-0.5">共 {PATIENTS.length} 位 · 新 {NEW_PATIENT_COUNT}</div>
            </div>
            <button onClick={() => toast("已邀请新患者")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-2">
            <Search className="w-4 h-4 opacity-90" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索姓名 / 床号" className="flex-1 bg-transparent text-sm placeholder:text-white/70 outline-none" />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-3">
        {/* 状态筛选 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 py-1">
          {filterChips.map(c => {
            const active = statusFilter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setStatusFilter(c.key)}
                className={`shrink-0 text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all ${
                  active ? `${accentBg[accent]} text-white shadow-card` : "bg-card text-foreground/70"
                }`}
              >
                {c.label} <span className={active ? "opacity-80" : "text-muted-foreground"}>({c.count})</span>
              </button>
            );
          })}
        </div>

        {/* 病症 + 入院时间 筛选 */}
        <div className="flex gap-2 text-[11px]">
          <select
            value={condition}
            onChange={e => setCondition(e.target.value)}
            className="flex-1 bg-card border border-border rounded-full px-3 py-1.5 outline-none"
          >
            <option value="">全部病症</option>
            {ALL_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={admitRange}
            onChange={e => setAdmitRange(e.target.value as any)}
            className="flex-1 bg-card border border-border rounded-full px-3 py-1.5 outline-none"
          >
            <option value="all">全部入院时间</option>
            <option value="0-3">0-3 天</option>
            <option value="4-14">4-14 天</option>
            <option value="15+">15 天以上</option>
          </select>
        </div>

        {statusFilter === "待首次评估" && list.length > 0 && (
          <div className="bg-warning-soft border border-warning/30 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold text-warning">{list.length} 位患者待首次评估</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">点击患者进入档案 · 安排团队线上评估</div>
            </div>
          </div>
        )}

        <div>
          <SectionTitle title={`患者列表 · ${list.length}`} />
          {list.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center text-xs text-muted-foreground">无匹配患者</div>
          ) : (
            <div className="space-y-2">
              {list.map(p => <PatientCard key={p.id} p={p} accent={accent} onClick={() => onPick(p)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PatientCard = ({ p, accent, onClick }: { p: Patient; accent: Accent; onClick: () => void }) => {
  const statusMap = {
    "新患者": "bg-warning/15 text-warning",
    "康复中": "bg-primary/10 text-primary",
    "待出院": "bg-success-soft text-success",
    "已出院": "bg-muted text-muted-foreground",
  }[p.status];
  return (
    <button onClick={onClick} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-start gap-3 active:scale-[0.99]">
      <div className={`w-11 h-11 rounded-xl ${accentBg[accent]} text-white flex items-center justify-center font-bold`}>{p.name[0]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[13px] font-semibold">{p.name}</div>
          <span className="text-[10px] text-muted-foreground">床 {p.bed}</span>
          {p.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning text-white font-bold">NEW</span>}
          {p.needFirstAssess && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary-soft text-primary font-semibold">待首评</span>}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.meta}</div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusMap}`}>{p.status}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground/70">{p.condition}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{p.shared.length}</span>
          {p.notes.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><StickyNote className="w-3 h-3" />{p.notes.length}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
    </button>
  );
};

/* ============== 患者详情 Sheet ============== */
export const PatientDetailSheet = ({ patient, accent, onAddNote, onShare }: {
  patient: Patient | null;
  accent: Accent;
  onAddNote: () => void;
  onShare: () => void;
}) => {
  if (!patient) return null;
  return (
    <div className="p-4 space-y-3">
      <div className={`rounded-2xl ${accentBg[accent]} p-5 text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold">{patient.name[0]}</div>
          <div>
            <div className="text-base font-bold">{patient.name} · 床 {patient.bed}</div>
            <div className="text-[11px] opacity-90 mt-0.5">{patient.meta}</div>
          </div>
        </div>
      </div>

      <SectionTitle title="共享团队成员" extra={<button onClick={onShare} className={`text-[11px] font-semibold ${accentText[accent]} flex items-center gap-1`}><Share2 className="w-3 h-3" />共享设置</button>} />
      <div className="bg-card rounded-2xl shadow-card p-3 flex flex-wrap gap-1.5">
        {patient.shared.map(m => (
          <span key={m} className="text-[11px] px-2 py-1 rounded-full bg-muted">{m}</span>
        ))}
      </div>

      <SectionTitle title={`协作备注 · ${patient.notes.length}`} extra={<button onClick={onAddNote} className={`text-[11px] font-semibold ${accentText[accent]} flex items-center gap-1`}><Plus className="w-3 h-3" />添加备注</button>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {patient.notes.length === 0 ? (
          <div className="p-4 text-[11px] text-muted-foreground text-center">暂无备注，点击右上角添加</div>
        ) : patient.notes.map((n, i) => (
          <div key={i} className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold">{n.author}</div>
              <div className="text-[10px] text-muted-foreground">{n.time}</div>
            </div>
            <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{n.text}</div>
          </div>
        ))}
      </div>

      {/* 治疗师档案：PT/OT/ST 治疗记录 */}
      {patient.therapyRecords && patient.therapyRecords.length > 0 && (
        <>
          <SectionTitle title={`治疗记录 · ${patient.therapyRecords.length}`} extra={<span className="text-[10px] text-muted-foreground">PT / OT / ST · 医师可查看</span>} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            {patient.therapyRecords.map((r, i) => {
              const tagColor = { PT: "bg-secondary-soft text-secondary", OT: "bg-primary-soft text-primary", ST: "bg-ai-soft text-ai" }[r.type];
              return (
                <div key={i} className="p-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${tagColor}`}>{r.type}</span>
                    <span className="text-[12px] font-semibold">{r.author}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{r.time}</span>
                  </div>
                  <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{r.text}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {patient.summaries && patient.summaries.length > 0 && (
        <>
          <SectionTitle title={`工作小结 · ${patient.summaries.length}`} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            {patient.summaries.map((s, i) => (
              <div key={i} className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold">{s.author}</div>
                  <div className="text-[10px] text-muted-foreground">{s.time}</div>
                </div>
                <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{s.text}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {patient.medChanges && patient.medChanges.length > 0 && (
        <>
          <SectionTitle title={`药物变动记录 · ${patient.medChanges.length}`} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            {patient.medChanges.map((m, i) => (
              <div key={i} className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold">{m.author}</div>
                  <div className="text-[10px] text-muted-foreground">{m.time}</div>
                </div>
                <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{m.text}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {patient.checkins && patient.checkins.length > 0 && (
        <>
          <SectionTitle title={`任务执行打卡 · ${patient.checkins.length}`} extra={<span className="text-[10px] text-muted-foreground">系统自动记录</span>} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            {patient.checkins.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <div className="flex-1">
                  <div className="text-[12px] font-semibold">{c.task}</div>
                  <div className="text-[10px] text-muted-foreground">{c.author}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">{c.time}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {patient.isNew && (
        <AICard title="新患者接入提醒">
          AI 已根据入院信息生成首次评估排期建议，建议尽快组织团队线上评估。
        </AICard>
      )}
    </div>
  );
};

/* ============== 添加备注 Sheet ============== */
export const AddNoteSheet = ({ patient, accent, onSave }: { patient: Patient | null; accent: Accent; onSave: (text: string) => void }) => {
  const [text, setText] = useState("");
  if (!patient) return null;
  return (
    <div className="p-4 space-y-3">
      <div className="bg-card rounded-2xl shadow-card p-3">
        <div className="text-[12px] font-semibold">{patient.name} · 床 {patient.bed}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">备注将共享给所有协作成员</div>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="输入对该患者的观察、提醒或交接内容..."
        className="w-full bg-card border border-border rounded-2xl p-3 text-sm h-40 outline-none"
      />
      <button
        onClick={() => { if (text.trim()) { onSave(text); setText(""); } }}
        className={`w-full ${accentBg[accent]} text-white rounded-2xl py-3 text-sm font-semibold`}
      >
        保存并共享给团队
      </button>
    </div>
  );
};

/* ============== 团队管理（我的内）============== */
export type TeamMember = { id: string; name: string; role: string; dept: string };

export const DEFAULT_TEAM: TeamMember[] = [
  { id: "t1", name: "李志远", role: "康复主任医师", dept: "神经康复科" },
  { id: "t2", name: "王雅琴", role: "PT/OT 治疗师", dept: "康复治疗部" },
  { id: "t3", name: "陈思雨", role: "ST 治疗师", dept: "康复治疗部" },
  { id: "t4", name: "赵静怡", role: "主管护师", dept: "康复护理组" },
  { id: "t5", name: "孙博士", role: "心理治疗师", dept: "心理康复" },
];

export const TeamManageSheet = ({ accent }: { accent: Accent }) => {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  return (
    <div className="p-4 space-y-3">
      <AICard title="团队成员共享患者">添加的成员将自动加入您所有患者的协作组，可查看评估、方案与备注。</AICard>
      <SectionTitle title={`当前团队 · ${members.length} 人`} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3.5">
            <div className={`w-9 h-9 rounded-full ${accentBg[accent]} text-white flex items-center justify-center text-sm font-bold`}>{m.name[0]}</div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold">{m.name}</div>
              <div className="text-[10px] text-muted-foreground">{m.role} · {m.dept}</div>
            </div>
            <button onClick={() => setMembers(members.filter(x => x.id !== m.id))} className="text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <SectionTitle title="新增成员" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="姓名" value={<input value={name} onChange={e => setName(e.target.value)} placeholder="请输入" className="w-32 text-right bg-muted rounded px-2 py-1 text-xs" />} />
        <FormRow label="角色" value={<input value={role} onChange={e => setRole(e.target.value)} placeholder="如 PT 治疗师" className="w-32 text-right bg-muted rounded px-2 py-1 text-xs" />} />
      </div>
      <button
        onClick={() => {
          if (!name.trim() || !role.trim()) { toast("请填写姓名和角色"); return; }
          setMembers([...members, { id: Date.now().toString(), name, role, dept: "新成员" }]);
          setName(""); setRole("");
          toast.success("成员已添加，已自动共享所有患者");
        }}
        className={`w-full ${accentBg[accent]} text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-1`}
      >
        <UserPlus className="w-4 h-4" /> 添加并共享患者
      </button>
    </div>
  );
};

/* ============== IM 聊天（团队会议 / 线上会诊 / 患者沟通）============== */
export type ChatMessage = { id: string; author: string; role?: string; text: string; time: string; isAI?: boolean; isMe?: boolean };

export const IMChatSheet = ({
  accent,
  title,
  subtitle,
  participants,
  initialMessages,
  onAISummary,
  enablePatientReminder,
  onClose,
}: {
  accent: Accent;
  title: string;
  subtitle: string;
  participants: string[];
  initialMessages: ChatMessage[];
  onAISummary: (summary: string) => void;
  enablePatientReminder?: boolean;
  onClose?: () => void;
}) => {
  const [msgs, setMsgs] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { id: Date.now().toString(), author: "我", text: input, time: "刚刚", isMe: true }]);
    setInput("");
  };

  const generateSummary = () => {
    const s = "📋 AI 会议纪要：\n1. 患者 FMA 提升 8 分，整体康复进度符合预期；\n2. 一致同意将 PT 训练强度上调 20%，新增 OT 厨房训练；\n3. ST 维持原计划，下周复评后再决定是否调整；\n4. 出院评估：再观察 1 周，待 Barthel ≥ 75 启动二级方案。";
    setSummary(s);
    setMsgs([...msgs, { id: "ai-" + Date.now(), author: "AI 助手", text: s, time: "刚刚", isAI: true }]);
    onAISummary(s);
    toast.success("AI 已生成纪要并同步至患者首次评估及康复方案");
  };

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className={`${accentBg[accent]} text-white px-4 py-3`}>
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center -ml-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
          <div className="flex-1">
            <div className="text-sm font-bold">{title}</div>
            <div className="text-[11px] opacity-90 mt-0.5">{subtitle} · {participants.length} 人在线</div>
          </div>
        </div>
        <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide">
          {participants.map(p => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur whitespace-nowrap">{p}</span>
          ))}
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/30">
        {msgs.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.isMe ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white ${m.isAI ? "gradient-ai" : m.isMe ? accentBg[accent] : "bg-muted-foreground"}`}>
              {m.isAI ? <Sparkles className="w-3.5 h-3.5" /> : m.author[0]}
            </div>
            <div className={`max-w-[78%] ${m.isMe ? "items-end" : ""} flex flex-col gap-1`}>
              <div className="text-[10px] text-muted-foreground px-1">{m.author}{m.role ? ` · ${m.role}` : ""} · {m.time}</div>
              <div className={`text-[12px] leading-relaxed px-3 py-2 rounded-2xl whitespace-pre-line ${
                m.isAI ? "bg-ai-soft border border-ai/20 text-foreground rounded-tl-sm" :
                m.isMe ? `${accentBg[accent]} text-white rounded-tr-sm` :
                "bg-card shadow-card rounded-tl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {summary && (
          <div className="bg-success-soft border border-success/30 rounded-2xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            <div className="text-[11px] text-success">纪要已自动同步到患者首次评估 & 康复方案</div>
          </div>
        )}
      </div>

      {/* AI / patient reminder bar */}
      <div className="px-3 py-2 bg-card border-t border-border/60 flex gap-2">
        <button onClick={generateSummary} className="flex-1 gradient-ai text-white text-[11px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> AI 总结并更新档案
        </button>
        {enablePatientReminder && (
          <button
            onClick={() => { setReminderSent(true); toast.success("已发送沟通提醒到患者及家属"); }}
            className={`flex-1 text-[11px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1 ${reminderSent ? "bg-success-soft text-success" : "border border-border"}`}
          >
            <Bell className="w-3.5 h-3.5" /> {reminderSent ? "已提醒患者" : "患者沟通提醒"}
          </button>
        )}
      </div>

      {/* input */}
      <div className="px-3 py-2 bg-card border-t border-border/60 flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="输入消息..."
          className="flex-1 bg-muted rounded-full px-4 py-2 text-xs outline-none"
        />
        <button onClick={send} className={`w-9 h-9 rounded-full ${accentBg[accent]} text-white flex items-center justify-center`}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const DEFAULT_MEETING_MSGS: ChatMessage[] = [
  { id: "1", author: "李志远", role: "康复医师", text: "各位老师下午好，我们来确认一下张建国的 V2 方案。本周 FMA 提升 8 分。", time: "10:31" },
  { id: "2", author: "王雅琴", role: "PT 治疗师", text: "下肢力量训练完成度很好，建议把每日 PT 时长从 50 → 60 分钟。", time: "10:32" },
  { id: "3", author: "陈思雨", role: "ST 治疗师", text: "构音训练保持原节奏，吞咽功能稳定，暂不调整。", time: "10:33" },
  { id: "4", author: "赵静怡", role: "护理", text: "夜间血压偶有波动，建议加强观察 q4h。", time: "10:34" },
  { id: "5", author: "孙博士", role: "心理", text: "情绪稳定，配合度高，可继续家属同伴支持模式。", time: "10:35" },
];

export const DEFAULT_VIDEO_MSGS: ChatMessage[] = [
  { id: "1", author: "李志远", role: "康复医师", text: "邀请各位会诊王秀英病例，髋关节术后第 5 天。", time: "14:02" },
  { id: "2", author: "王雅琴", role: "PT 治疗师", text: "Berg 32 分，需重点关注负重训练耐受。", time: "14:03" },
  { id: "3", author: "赵静怡", role: "护理", text: "VAS 由 6 → 3，疼痛控制理想。", time: "14:04" },
];
