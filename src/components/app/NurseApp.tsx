import { useState } from "react";
import { ScreenShell, TabBar } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, TodoItem } from "@/components/app/TodoQueue";
import { toast } from "sonner";
import {
  Bell,
  ChevronRight,
  Pill,
  HeartPulse,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Syringe,
  Activity,
  ClipboardCheck,
  Users,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

type SheetKey =
  | null
  | "med"
  | "vitals"
  | "edu"
  | "inject"
  | "obs"
  | "bed"
  | "order"
  | "patient"
  | "eduDetail"
  | "execTask";

type QueueKey = "med" | "vitals" | "inject" | "obs" | "edu" | "execTask" | "order";

const QUEUE_TITLE: Record<QueueKey, string> = {
  med: "待执行给药",
  vitals: "待测生命体征",
  inject: "待执行注射",
  obs: "待病情观察",
  edu: "待开展宣教",
  execTask: "待执行护理任务",
  order: "待执行医嘱",
};

const QUEUES: Record<QueueKey, TodoItem[]> = {
  med: [
    { id: "m1", patient: "303 张建国", meta: "阿司匹林 100mg · IV", detail: "静脉给药 · 双人核对", time: "14:00", urgency: "high" },
    { id: "m2", patient: "310 陈丽华", meta: "多奈哌齐 5mg · po", detail: "口服给药", time: "15:30", urgency: "medium" },
    { id: "m3", patient: "305 王秀英", meta: "塞来昔布 200mg · po", detail: "餐后口服", time: "16:00", urgency: "medium" },
    { id: "m4", patient: "307 李 强", meta: "巴氯芬 10mg · po", detail: "睡前口服", time: "21:00", urgency: "low" },
  ],
  vitals: [
    { id: "v1", patient: "305 王秀英", meta: "血压 + 心率", detail: "VS q4h · 第 3 次", time: "14:30", urgency: "medium" },
    { id: "v2", patient: "303 张建国", meta: "血压 + 心率 + 血氧", detail: "VS q6h", time: "15:00", urgency: "medium" },
    { id: "v3", patient: "312 刘伟明", meta: "全套生命体征", detail: "术后观察", time: "16:00", urgency: "low" },
  ],
  inject: [
    { id: "in1", patient: "305 王秀英", meta: "低分子肝素 0.4ml ih", detail: "腹部皮下", time: "14:35", urgency: "medium" },
    { id: "in2", patient: "310 陈丽华", meta: "维生素 B12 1ml im", detail: "臀部肌注", time: "16:30", urgency: "low" },
  ],
  obs: [
    { id: "o1", patient: "303 张建国", meta: "夜间血压波动", detail: "AI 提示加强观察", urgency: "high" },
    { id: "o2", patient: "307 李 强", meta: "压疮高风险监测", detail: "Braden 14 分", urgency: "medium" },
    { id: "o3", patient: "312 刘伟明", meta: "术后伤口情况", detail: "第 5 天", urgency: "medium" },
  ],
  edu: [
    { id: "ed1", patient: "303 张建国", meta: "脑卒中后吞咽训练", detail: "AI 推荐内容 · 视频 + 图文", urgency: "medium" },
    { id: "ed2", patient: "305 王秀英", meta: "髋关节术后家庭防护", detail: "术后必读", urgency: "medium" },
    { id: "ed3", patient: "307 李 强", meta: "出院后家庭训练指导", detail: "出院前必修", urgency: "high" },
    { id: "ed4", patient: "全部患者", meta: "用药安全与不良反应", detail: "群发宣教", urgency: "low" },
  ],
  execTask: [
    { id: "et1", patient: "312 刘伟明", meta: "伤口换药", detail: "术后第 5 天", time: "16:00", urgency: "high" },
    { id: "et2", patient: "303 张建国", meta: "翻身 + 拍背", detail: "q2h", time: "15:00", urgency: "medium" },
    { id: "et3", patient: "307 李 强", meta: "导尿管护理", detail: "每日清洁", time: "17:00", urgency: "medium" },
  ],
  order: [
    { id: "or1", patient: "303 张建国", meta: "阿司匹林 100mg qd IV", detail: "医师签发 · 长期", urgency: "high" },
    { id: "or2", patient: "305 王秀英", meta: "低分子肝素 0.4ml q12h ih", detail: "医师签发", urgency: "medium" },
    { id: "or3", patient: "307 李 强", meta: "VS q4h", detail: "新增医嘱", urgency: "medium" },
    { id: "or4", patient: "310 陈丽华", meta: "多奈哌齐 5mg qn po", detail: "新增医嘱", urgency: "low" },
  ],
};

export const NurseApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [queue, setQueue] = useState<QueueKey | null>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const open = (k: SheetKey) => setSheet(k);
  const close = () => setSheet(null);
  const openQueue = (k: QueueKey) => setQueue(k);
  const closeQueue = () => setQueue(null);
  const pickFromQueue = (item: TodoItem, sheetKey: SheetKey) => {
    setActivePatient(item.patient);
    setQueue(null);
    setSheet(sheetKey);
  };

  // edu queue picks open eduDetail; order queue picks open order detail
  const queueToSheet: Record<QueueKey, SheetKey> = {
    med: "med",
    vitals: "vitals",
    inject: "inject",
    obs: "obs",
    edu: "eduDetail",
    execTask: "execTask",
    order: "order",
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="nurse" />}>
      {tab === "home" && <Home onOpen={open} onOpenQueue={openQueue} />}
      {tab === "tasks" && <Tasks onOpenQueue={openQueue} />}
      {tab === "ai" && <Edu onOpen={open} onOpenQueue={openQueue} />}
      {tab === "me" && <Me />}

      {(["med", "vitals", "inject", "obs", "edu", "execTask", "order"] as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="nurse">
          <TodoQueueList accent="nurse" items={QUEUES[k]} onPick={(item) => pickFromQueue(item, queueToSheet[k])} />
        </PhoneSheet>
      ))}

      <PhoneSheet open={sheet === "med"} onClose={close} title={`给药操作${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("给药完成 · 已自动生成执行记录"); close(); }}>确认给药完成</PrimaryBtn>}>
        <MedSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "vitals"} onClose={close} title={`生命体征录入${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("生命体征已保存 · 已同步医师端"); close(); }}>保存</PrimaryBtn>}>
        <VitalsSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "edu"} onClose={close} title="康复宣教" accent="nurse">
        <EduListSheet onOpen={open} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "inject"} onClose={close} title={`注射记录${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("注射记录已保存"); close(); }}>保存记录</PrimaryBtn>}>
        <InjectSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "obs"} onClose={close} title={`病情观察${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("观察记录已上传医师端"); close(); }}>上报观察</PrimaryBtn>}>
        <ObsSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "bed"} onClose={close} title="床位管理" accent="nurse">
        <BedSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "order"} onClose={close} title="医嘱执行" accent="nurse">
        <OrderSheet onOpen={open} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patient"} onClose={close} title="患者床卡 · 张建国" accent="nurse">
        <PatientSheet onOpen={open} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "eduDetail"} onClose={close} title={`宣教内容${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("已推送给患者及家属"); close(); }}>一键推送患者</PrimaryBtn>}>
        <EduDetailSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "execTask"} onClose={close} title={`执行护理任务${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("任务已完成 · 已记录"); close(); }}>完成任务</PrimaryBtn>}>
        <ExecTaskSheet />
      </PhoneSheet>
    </ScreenShell>
  );
};

const Home = ({
  onOpen,
  onOpenQueue,
}: {
  onOpen: (k: SheetKey) => void;
  onOpenQueue: (k: QueueKey) => void;
}) => {
  const tiles: { icon: any; label: string; color: string; k: QueueKey }[] = [
    { icon: Pill, label: "给药操作", color: "text-warning bg-warning-soft", k: "med" },
    { icon: HeartPulse, label: "生命体征", color: "text-destructive/80 bg-red-50", k: "vitals" },
    { icon: Syringe, label: "注射记录", color: "text-primary bg-primary-soft", k: "inject" },
    { icon: Activity, label: "病情观察", color: "text-secondary bg-secondary-soft", k: "obs" },
    { icon: BookOpen, label: "康复宣教", color: "text-ai bg-ai-soft", k: "edu" },
    { icon: ClipboardCheck, label: "护理任务", color: "text-role-nurse bg-rose-50", k: "execTask" },
    { icon: Stethoscope, label: "医嘱执行", color: "text-role-nurse bg-rose-50", k: "order" },
  ];
  return (
    <div className="pb-4">
      <div className="gradient-nurse px-5 pt-2 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">您好，赵护士</div>
            <div className="text-lg font-semibold mt-0.5">康复护理 · 西区病房</div>
          </div>
          <button onClick={() => toast("您有 4 条 AI 推送任务")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>
        <div className="relative mt-5">
          <PendingStatRow
            items={[
              { label: "待给药", count: QUEUES.med.length, onClick: () => onOpenQueue("med") },
              { label: "待护理", count: QUEUES.execTask.length, onClick: () => onOpenQueue("execTask") },
              { label: "待宣教", count: QUEUES.edu.length, onClick: () => onOpenQueue("edu") },
            ]}
          />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <AICard title="AI 推送的护理任务" action={
          <button onClick={() => onOpenQueue("execTask")} className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1">
            进入待办列表 <ArrowRight className="w-4 h-4" />
          </button>
        }>
          当前 {QUEUES.execTask.length + QUEUES.med.length} 项任务已按优先级智能排序，最紧急：303 床张建国 14:00 静脉给药。
        </AICard>

        <div>
          <SectionTitle title="护士工作台 · 点击查看待办列表" />
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
            <WorkbenchTile icon={Users} label="床位管理" color="text-success bg-success-soft" onClick={() => onOpen("bed")} />
          </div>
        </div>

        <div>
          <SectionTitle title="紧急任务" extra={<span className="text-[10px] text-destructive font-semibold">{QUEUES.med.filter(m => m.urgency === "high").length} 项</span>} />
          <button onClick={() => onOpenQueue("med")} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 border-l-4 border-l-destructive flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">303 床 · 张建国</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">静脉给药 · 阿司匹林 100mg</div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">14:00</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Tasks = ({ onOpenQueue }: { onOpenQueue: (k: QueueKey) => void }) => {
  const queues: { k: QueueKey; label: string; desc: string; icon: any; color: string }[] = [
    { k: "med", label: "给药操作", desc: "三查七对 · 双人核对", icon: Pill, color: "bg-warning-soft text-warning" },
    { k: "vitals", label: "生命体征", desc: "VS 测量录入", icon: HeartPulse, color: "bg-red-50 text-destructive/80" },
    { k: "inject", label: "注射记录", desc: "皮下 / 肌注 / 静推", icon: Syringe, color: "bg-primary-soft text-primary" },
    { k: "obs", label: "病情观察", desc: "AI 异常监测", icon: Activity, color: "bg-secondary-soft text-secondary" },
    { k: "edu", label: "康复宣教", desc: "AI 智能推送", icon: BookOpen, color: "bg-ai-soft text-ai" },
    { k: "execTask", label: "护理任务", desc: "翻身 / 换药 / 护理", icon: ClipboardCheck, color: "bg-rose-50 text-role-nurse" },
    { k: "order", label: "医嘱执行", desc: "医师签发", icon: Stethoscope, color: "bg-rose-50 text-role-nurse" },
  ];
  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="text-xl font-bold mb-1">待办分类</h2>
      <p className="text-xs text-muted-foreground mb-4">按事项类型查看患者列表，逐位执行</p>
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

const Edu = ({
  onOpen,
  onOpenQueue,
}: {
  onOpen: (k: SheetKey) => void;
  onOpenQueue: (k: QueueKey) => void;
}) => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="rounded-2xl p-5 gradient-nurse text-white relative overflow-hidden">
      <BookOpen className="absolute top-3 right-3 w-16 h-16 opacity-20" />
      <div className="text-xs opacity-80">康复宣教中心</div>
      <div className="text-2xl font-bold mt-1">AI 智能宣教</div>
      <div className="text-xs opacity-90 mt-2">个性化内容 · 一键推送给患者</div>
    </div>

    <AICard title={`今日待宣教 · ${QUEUES.edu.length} 位患者`} action={
      <button onClick={() => onOpenQueue("edu")} className="w-full bg-ai text-ai-foreground rounded-xl py-2.5 text-sm font-semibold">查看待宣教列表</button>
    }>
      <div className="space-y-2 text-[12px]">
        {QUEUES.edu.slice(0, 3).map((e) => (
          <div key={e.id} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-ai" /><span>{e.meta} · {e.patient}</span></div>
        ))}
      </div>
    </AICard>

    <SectionTitle title="宣教素材库" />
    <div className="grid grid-cols-2 gap-2">
      {[
        { title: "吞咽训练", count: 12, color: "gradient-doctor" },
        { title: "肢体康复", count: 28, color: "gradient-therapist" },
        { title: "用药指南", count: 16, color: "gradient-nurse" },
        { title: "心理疏导", count: 9, color: "gradient-ai" },
      ].map((c) => (
        <button key={c.title} onClick={() => onOpen("eduDetail")} className={`${c.color} text-left rounded-2xl p-4 text-white relative overflow-hidden h-24`}>
          <div className="text-sm font-bold">{c.title}</div>
          <div className="text-[10px] opacity-80 mt-1">{c.count} 个素材</div>
          <ArrowRight className="absolute bottom-3 right-3 w-4 h-4 opacity-80" />
        </button>
      ))}
    </div>
  </div>
);

const Me = () => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-nurse flex items-center justify-center text-white text-xl font-bold">赵</div>
      <div>
        <div className="text-base font-bold">赵静怡 主管护师</div>
        <div className="text-xs text-muted-foreground mt-0.5">康复护理组 · 12 年</div>
      </div>
    </div>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["护理记录", "给药历史", "宣教记录", "排班", "设置"].map((it) => (
        <button key={it} onClick={() => toast(it + " · 即将开放")} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===================== Sheets ===================== */

const MedSheet = ({ patient }: { patient?: string }) => (
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
        { l: "体温 ℃", d: "36.7" },
        { l: "脉搏 bpm", d: "78" },
        { l: "呼吸 /min", d: "18" },
        { l: "血压 mmHg", d: "128/82" },
        { l: "血氧 %", d: "98" },
        { l: "疼痛 VAS", d: "3" },
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

const EduListSheet = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => (
  <div className="p-4 space-y-2">
    {["脑卒中后吞咽训练", "髋关节术后家庭防护", "用药安全与不良反应", "心理疏导 · 家属篇", "康复期营养指南"].map((t) => (
      <button key={t} onClick={() => onOpen("eduDetail")} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-ai-soft flex items-center justify-center"><BookOpen className="w-5 h-5 text-ai" /></div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold">{t}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">视频 · 图文 · 测验</div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    ))}
  </div>
);

const EduDetailSheet = () => (
  <div className="p-4 space-y-3">
    <div className="rounded-2xl gradient-nurse text-white p-5">
      <BookOpen className="w-8 h-8 mb-2 opacity-90" />
      <div className="text-lg font-bold">脑卒中后吞咽训练</div>
      <div className="text-[11px] opacity-90 mt-1">视频 5 分钟 · 图文 8 页 · 课后测验</div>
    </div>
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2 text-sm">
      <p className="text-foreground/80 leading-relaxed">本指南帮助患者及家属掌握安全进食、口腔运动训练、呛咳应急处理等技能。</p>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {["视频", "图文", "测验"].map((t) => (
          <div key={t} className="text-center text-xs bg-muted py-2 rounded-lg">{t}</div>
        ))}
      </div>
    </div>
    <SectionTitle title="选择推送对象" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["303 张建国", "305 王秀英", "307 李 强"].map((p) => (
        <FormRow key={p} label={p} value={<input type="checkbox" defaultChecked className="w-4 h-4 accent-pink-500" />} />
      ))}
    </div>
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

const BedSheet = () => (
  <div className="p-4 space-y-3">
    <SectionTitle title="西区病房床位" extra={<span className="text-[10px] text-muted-foreground">16/20</span>} />
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 20 }).map((_, i) => {
        const occ = i < 16;
        return (
          <div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] ${occ ? "gradient-nurse text-white" : "bg-muted text-muted-foreground"}`}>
            <div className="text-[9px] opacity-80">床</div>
            <div className="text-sm font-bold">{301 + i}</div>
          </div>
        );
      })}
    </div>
  </div>
);

const OrderSheet = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => (
  <div className="p-4 space-y-2">
    <AICard title="医嘱已自动转护理任务">医师签发的医嘱已分解为可执行护理任务。</AICard>
    {[
      { p: "303 张建国", o: "阿司匹林 100mg qd IV", k: "med" as SheetKey },
      { p: "305 王秀英", o: "低分子肝素 0.4ml q12h ih", k: "inject" as SheetKey },
      { p: "307 李 强", o: "VS q4h", k: "vitals" as SheetKey },
      { p: "310 陈丽华", o: "多奈哌齐 5mg qn po", k: "med" as SheetKey },
    ].map((o) => (
      <button key={o.p} onClick={() => onOpen(o.k)} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5">
        <div className="text-[13px] font-semibold">{o.p}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{o.o}</div>
      </button>
    ))}
  </div>
);

const PatientSheet = ({ onOpen }: { onOpen: (k: SheetKey) => void }) => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-nurse text-white flex items-center justify-center font-bold">张</div>
        <div className="flex-1">
          <div className="text-sm font-bold">张建国 · 男 56 岁</div>
          <div className="text-[11px] text-muted-foreground">床号 303 · 脑卒中后偏瘫</div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[
        { l: "给药", k: "med" as SheetKey, i: Pill },
        { l: "体征", k: "vitals" as SheetKey, i: HeartPulse },
        { l: "宣教", k: "eduDetail" as SheetKey, i: BookOpen },
        { l: "观察", k: "obs" as SheetKey, i: Activity },
        { l: "注射", k: "inject" as SheetKey, i: Syringe },
        { l: "医嘱", k: "order" as SheetKey, i: Stethoscope },
      ].map((it) => (
        <button key={it.l} onClick={() => onOpen(it.k)} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card">
          <it.i className="w-5 h-5 text-role-nurse" />
          <span className="text-[11px]">{it.l}</span>
        </button>
      ))}
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
    <textarea placeholder="伤口情况记录..." className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-20 outline-none" />
  </div>
);
