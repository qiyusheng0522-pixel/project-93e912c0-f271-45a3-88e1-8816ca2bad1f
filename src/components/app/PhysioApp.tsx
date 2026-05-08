import { useMemo, useState } from "react";
import {
  Activity,
  Cpu,
  Calendar,
  User,
  Plus,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Sparkles,
  Zap,
  Waves,
  Flame,
  Magnet,
  Sun,
  Move3d,
  CircleDot,
  X,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import { ScreenShell, TabBar, type TabBarItem } from "./TabBar";
import { PhoneSheet, PrimaryBtn } from "./Sheet";
import { AICard, SectionTitle } from "./UI";
import { toast } from "sonner";

/** Physiotherapy device catalogue */
type DeviceStatus = "idle" | "in_use" | "maintenance" | "fault";

interface PhysioDevice {
  id: string;
  name: string;
  code: string;
  room: string;
  icon: typeof Zap;
  status: DeviceStatus;
  todayCount: number;
  capacity: number; // sessions per day
  nextSlot?: string;
  lastMaint: string;
}

const DEVICES: PhysioDevice[] = [
  { id: "d1", name: "中频电刺激仪", code: "EMS-01", room: "理疗一区·301", icon: Zap, status: "in_use", todayCount: 6, capacity: 12, nextSlot: "10:30", lastMaint: "2026-04-22" },
  { id: "d2", name: "超短波治疗仪", code: "USW-02", room: "理疗一区·302", icon: Waves, status: "in_use", todayCount: 4, capacity: 10, nextSlot: "10:45", lastMaint: "2026-04-15" },
  { id: "d3", name: "蜡疗机",       code: "WAX-01", room: "理疗二区·305", icon: Flame, status: "idle",   todayCount: 3, capacity: 8,  nextSlot: "11:00", lastMaint: "2026-03-30" },
  { id: "d4", name: "脉冲磁疗仪",   code: "MAG-03", room: "理疗二区·306", icon: Magnet, status: "idle",   todayCount: 2, capacity: 10, nextSlot: "11:00", lastMaint: "2026-04-10" },
  { id: "d5", name: "半导体激光治疗仪", code: "LSR-01", room: "理疗二区·307", icon: Sun,  status: "maintenance", todayCount: 0, capacity: 10, lastMaint: "2026-05-08" },
  { id: "d6", name: "颈腰椎牵引床", code: "TRC-04", room: "理疗三区·310", icon: Move3d, status: "in_use", todayCount: 5, capacity: 10, nextSlot: "10:30", lastMaint: "2026-04-02" },
  { id: "d7", name: "肌电生物反馈仪", code: "EMG-02", room: "理疗三区·311", icon: CircleDot, status: "fault", todayCount: 0, capacity: 8, lastMaint: "2026-05-05" },
  { id: "d8", name: "超声波治疗仪", code: "USD-01", room: "理疗一区·303", icon: Waves, status: "idle",   todayCount: 1, capacity: 10, nextSlot: "13:30", lastMaint: "2026-04-18" },
];

const STATUS_META: Record<DeviceStatus, { label: string; cls: string; dot: string }> = {
  idle:        { label: "空闲", cls: "bg-success-soft text-success",   dot: "bg-success" },
  in_use:      { label: "使用中", cls: "bg-primary-soft text-primary", dot: "bg-primary" },
  maintenance: { label: "维护中", cls: "bg-warning-soft text-warning", dot: "bg-warning" },
  fault:       { label: "故障",   cls: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:30"];

interface Booking {
  device: string; // device code
  slot: string;
  patient: string;
  bed: string;
  rx: string; // prescription type
  duration: number;
  status: "done" | "doing" | "todo";
}

const BOOKINGS: Booking[] = [
  { device: "EMS-01", slot: "09:00", patient: "陈建国", bed: "01-08", rx: "中频·下肢", duration: 20, status: "done" },
  { device: "EMS-01", slot: "09:30", patient: "王凤兰", bed: "02-03", rx: "中频·肩背", duration: 20, status: "done" },
  { device: "EMS-01", slot: "10:30", patient: "李大山", bed: "03-12", rx: "中频·上肢", duration: 20, status: "doing" },
  { device: "EMS-01", slot: "13:30", patient: "刘玉芳", bed: "01-04", rx: "中频·腰背", duration: 20, status: "todo" },
  { device: "USW-02", slot: "09:00", patient: "周建华", bed: "02-09", rx: "超短波·膝", duration: 15, status: "done" },
  { device: "USW-02", slot: "10:45", patient: "吴月梅", bed: "03-02", rx: "超短波·肩", duration: 15, status: "todo" },
  { device: "USW-02", slot: "14:00", patient: "陈建国", bed: "01-08", rx: "超短波·腰", duration: 15, status: "todo" },
  { device: "WAX-01", slot: "09:30", patient: "张明", bed: "01-11", rx: "蜡疗·手部", duration: 25, status: "done" },
  { device: "WAX-01", slot: "11:00", patient: "孙素珍", bed: "02-15", rx: "蜡疗·腕关节", duration: 25, status: "todo" },
  { device: "MAG-03", slot: "10:00", patient: "黄爱华", bed: "03-06", rx: "磁疗·颈椎", duration: 20, status: "done" },
  { device: "MAG-03", slot: "14:30", patient: "李大山", bed: "03-12", rx: "磁疗·肩部", duration: 20, status: "todo" },
  { device: "TRC-04", slot: "09:00", patient: "赵志强", bed: "02-07", rx: "腰椎牵引", duration: 20, status: "done" },
  { device: "TRC-04", slot: "10:30", patient: "周建华", bed: "02-09", rx: "颈椎牵引", duration: 20, status: "doing" },
  { device: "TRC-04", slot: "15:00", patient: "王凤兰", bed: "02-03", rx: "腰椎牵引", duration: 20, status: "todo" },
  { device: "USD-01", slot: "13:30", patient: "刘玉芳", bed: "01-04", rx: "超声·肩袖", duration: 10, status: "todo" },
];

const TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: Activity },
  { key: "devices", label: "设备", icon: Cpu },
  { key: "schedule", label: "排班", icon: Calendar },
  { key: "me", label: "我的", icon: User },
];

export const PhysioApp = () => {
  const [tab, setTab] = useState("home");
  const [openDevice, setOpenDevice] = useState<PhysioDevice | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const stats = useMemo(() => {
    const total = DEVICES.length;
    const inUse = DEVICES.filter((d) => d.status === "in_use").length;
    const idle = DEVICES.filter((d) => d.status === "idle").length;
    const fault = DEVICES.filter((d) => d.status === "fault" || d.status === "maintenance").length;
    const sessions = BOOKINGS.length;
    return { total, inUse, idle, fault, sessions };
  }, []);

  return (
    <ScreenShell tabBar={<TabBar items={TABS} active={tab} accent={"physio" as any} onChange={setTab} />}>
      {tab === "home" && <HomeView stats={stats} onOpenDevice={setOpenDevice} onAdd={() => setOpenAdd(true)} />}
      {tab === "devices" && <DevicesView onOpenDevice={setOpenDevice} />}
      {tab === "schedule" && <ScheduleView onOpenDevice={(code) => setOpenDevice(DEVICES.find(d => d.code === code) ?? null)} />}
      {tab === "me" && <MeView />}

      <PhoneSheet
        open={!!openDevice}
        title={openDevice ? `${openDevice.name} · ${openDevice.code}` : ""}
        onClose={() => setOpenDevice(null)}
        accent="physio"
        footer={
          openDevice && (
            <div className="flex gap-2">
              <button
                onClick={() => { toast.success("已登记维护"); setOpenDevice(null); }}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold border border-border bg-card"
              >
                登记维护
              </button>
              <button
                onClick={() => { toast.success("已加入今日排班"); setOpenDevice(null); }}
                className="flex-1 gradient-physio text-white rounded-2xl py-3 text-sm font-semibold shadow-card"
              >
                新建预约
              </button>
            </div>
          )
        }
      >
        {openDevice && <DeviceDetail device={openDevice} />}
      </PhoneSheet>

      <PhoneSheet
        open={openAdd}
        title="新建理疗预约"
        onClose={() => setOpenAdd(false)}
        accent="physio"
        footer={
          <PrimaryBtn variant="physio" onClick={() => { toast.success("已分配设备并通知患者"); setOpenAdd(false); }}>
            AI 智能分配并通知
          </PrimaryBtn>
        }
      >
        <NewBookingView />
      </PhoneSheet>
    </ScreenShell>
  );
};

/* -------------------- Home -------------------- */

const HomeView = ({
  stats,
  onOpenDevice,
  onAdd,
}: {
  stats: { total: number; inUse: number; idle: number; fault: number; sessions: number };
  onOpenDevice: (d: PhysioDevice) => void;
  onAdd: () => void;
}) => (
  <div className="px-4 pt-2 pb-6 space-y-4">
    {/* Header */}
    <div className="gradient-physio text-white rounded-3xl p-5 shadow-card relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
      <div className="relative">
        <div className="text-[11px] font-medium opacity-90">理疗设备工作台</div>
        <div className="text-lg font-bold mt-0.5">徐主管 · 早上好</div>
        <div className="text-xs opacity-90 mt-1">今日共 {stats.sessions} 例理疗，{stats.inUse} 台设备运行中</div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          <Chip n={stats.total} label="设备总数" />
          <Chip n={stats.inUse} label="使用中" />
          <Chip n={stats.idle} label="空闲" />
          <Chip n={stats.fault} label="异常" />
        </div>
      </div>
    </div>

    <AICard
      title="AI 设备调度建议"
      action={
        <button onClick={onAdd} className="text-xs font-semibold text-ai inline-flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> 一键新建预约
        </button>
      }
    >
      检测到 <b>EMS-01 中频电</b> 14:00 后空档，建议将 03 床 <b>李大山</b> 中频治疗调整至该时段，可缩短等待 35 分钟；
      <b>LSR-01 激光</b> 维护中，今日 4 例已自动改派至 USD-01 超声波。
    </AICard>

    <div>
      <SectionTitle title="设备实时状态" extra={<span className="text-[11px] text-muted-foreground">{stats.total} 台</span>} />
      <div className="grid grid-cols-2 gap-2.5">
        {DEVICES.map((d) => (
          <DeviceMiniCard key={d.id} device={d} onClick={() => onOpenDevice(d)} />
        ))}
      </div>
    </div>

    <div>
      <SectionTitle title="今日异常 / 提醒" />
      <div className="space-y-2">
        <AlertItem icon={AlertTriangle} tone="destructive" title="EMG-02 肌电仪故障"
          desc="电极通道 3 信号异常，已通知工程，2 例预约改派 EMS-01。" />
        <AlertItem icon={Wrench} tone="warning" title="LSR-01 激光仪保养中"
          desc="计划保养至 14:30 完成，期间不可预约。" />
        <AlertItem icon={Clock3} tone="primary" title="蜡疗 11:00 即将开始"
          desc="02-15 床 孙素珍 准备就绪，蜡块预热完成。" />
      </div>
    </div>
  </div>
);

const Chip = ({ n, label }: { n: number; label: string }) => (
  <div className="rounded-xl bg-white/15 backdrop-blur px-2 py-2 text-center">
    <div className="text-lg font-bold leading-none">{n}</div>
    <div className="text-[10px] opacity-90 mt-1">{label}</div>
  </div>
);

const DeviceMiniCard = ({ device, onClick }: { device: PhysioDevice; onClick: () => void }) => {
  const Icon = device.icon;
  const meta = STATUS_META[device.status];
  const pct = Math.round((device.todayCount / device.capacity) * 100);
  return (
    <button onClick={onClick} className="text-left rounded-2xl bg-card border border-border/60 p-3 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl gradient-physio/10 bg-orange-50 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-role-physio" />
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${meta.cls}`}>{meta.label}</span>
      </div>
      <div className="text-[13px] font-semibold text-foreground truncate">{device.name}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{device.code} · {device.room}</div>
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>今日使用</span>
          <span className="font-semibold text-foreground">{device.todayCount}/{device.capacity}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full gradient-physio" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      </div>
    </button>
  );
};

const AlertItem = ({
  icon: Icon, tone, title, desc,
}: { icon: typeof AlertTriangle; tone: "destructive" | "warning" | "primary"; title: string; desc: string }) => {
  const cls = {
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning-soft text-warning",
    primary: "bg-primary-soft text-primary",
  }[tone];
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-3 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
};

/* -------------------- Devices list -------------------- */

const DevicesView = ({ onOpenDevice }: { onOpenDevice: (d: PhysioDevice) => void }) => {
  const [filter, setFilter] = useState<"all" | DeviceStatus>("all");
  const list = filter === "all" ? DEVICES : DEVICES.filter((d) => d.status === filter);
  return (
    <div className="px-4 pt-3 pb-6">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
        {([
          ["all", `全部 ${DEVICES.length}`],
          ["idle", "空闲"],
          ["in_use", "使用中"],
          ["maintenance", "维护中"],
          ["fault", "故障"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k as any)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              filter === k ? "gradient-physio text-white shadow-card" : "bg-card border border-border text-foreground/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {list.map((d) => {
          const Icon = d.icon;
          const meta = STATUS_META[d.status];
          return (
            <button key={d.id} onClick={() => onOpenDevice(d)}
              className="w-full text-left rounded-2xl bg-card border border-border/60 p-3 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-role-physio" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-semibold truncate">{d.name}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${meta.cls}`}>{meta.label}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {d.code} · {d.room} · 今日 {d.todayCount}/{d.capacity}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------- Schedule matrix -------------------- */

const ScheduleView = ({ onOpenDevice }: { onOpenDevice: (code: string) => void }) => {
  return (
    <div className="px-3 pt-3 pb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <div className="text-[15px] font-semibold">设备排班矩阵</div>
          <div className="text-[10px] text-muted-foreground">横向时段 · 纵向设备 · 点击单元查看预约</div>
        </div>
        <button className="text-xs font-semibold text-role-physio inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> AI 重排
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="border-collapse text-[11px] min-w-full">
            <thead>
              <tr className="bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/60 px-2 py-2 text-left font-semibold text-foreground/80 min-w-[110px]">
                  设备
                </th>
                {SLOTS.map((s) => (
                  <th key={s} className="px-1.5 py-2 font-medium text-foreground/70 min-w-[64px]">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEVICES.map((d) => (
                <tr key={d.id} className="border-t border-border/60">
                  <td className="sticky left-0 bg-card px-2 py-2 align-top">
                    <button onClick={() => onOpenDevice(d.code)} className="text-left">
                      <div className="text-[12px] font-semibold leading-tight">{d.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{d.code}</div>
                    </button>
                  </td>
                  {SLOTS.map((slot) => {
                    const b = BOOKINGS.find((x) => x.device === d.code && x.slot === slot);
                    if (!b) {
                      return (
                        <td key={slot} className="p-1 align-top">
                          <div className="h-[52px] rounded-md border border-dashed border-border/70 text-[9px] text-muted-foreground flex items-center justify-center">
                            空
                          </div>
                        </td>
                      );
                    }
                    const tone =
                      b.status === "done" ? "bg-success-soft border-success/30 text-success"
                      : b.status === "doing" ? "bg-primary-soft border-primary/30 text-primary"
                      : "bg-orange-50 border-role-physio/30 text-role-physio";
                    return (
                      <td key={slot} className="p-1 align-top">
                        <button
                          onClick={() => toast(b.patient + " · " + b.rx, { description: `${b.bed} · ${b.duration}min` })}
                          className={`w-full h-[52px] rounded-md border px-1.5 py-1 text-left ${tone}`}
                        >
                          <div className="text-[10px] font-semibold truncate">{b.patient}</div>
                          <div className="text-[9px] truncate opacity-90">{b.rx}</div>
                          <div className="text-[9px] opacity-80">{b.bed}</div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 border-t border-border/60 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-success" /> 已完成</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" /> 进行中</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-role-physio" /> 待开始</span>
        </div>
      </div>

      <div className="mt-4">
        <AICard title="AI 排班洞察">
          11:00–13:30 为午间空档，<b>WAX-01 蜡疗</b> 利用率仅 30%；建议将下午 2 例蜡疗前移至 11:00、11:30，可释放下午时段给牵引床。
        </AICard>
      </div>
    </div>
  );
};

/* -------------------- Device detail sheet -------------------- */

const DeviceDetail = ({ device }: { device: PhysioDevice }) => {
  const today = BOOKINGS.filter((b) => b.device === device.code);
  const meta = STATUS_META[device.status];
  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <div className="rounded-2xl gradient-physio text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <device.icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold">{device.name}</div>
            <div className="text-[11px] opacity-90 mt-0.5">{device.code} · {device.room}</div>
          </div>
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white/20`}>{meta.label}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Chip n={device.todayCount} label="今日已用" />
          <Chip n={device.capacity - device.todayCount} label="剩余次数" />
          <Chip n={Math.round((device.todayCount / device.capacity) * 100)} label="使用率%" />
        </div>
      </div>

      <div>
        <SectionTitle title="今日预约" extra={<span className="text-[11px] text-muted-foreground">{today.length} 例</span>} />
        <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border/60 overflow-hidden">
          {today.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">暂无预约</div>
          )}
          {today.map((b, i) => (
            <div key={i} className="px-3 py-2.5 flex items-center gap-3">
              <div className="text-[12px] font-semibold w-12 shrink-0">{b.slot}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{b.patient} <span className="text-muted-foreground text-[11px]">{b.bed}</span></div>
                <div className="text-[11px] text-muted-foreground truncate">{b.rx} · {b.duration} 分钟</div>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                b.status === "done" ? "bg-success-soft text-success"
                : b.status === "doing" ? "bg-primary-soft text-primary"
                : "bg-orange-50 text-role-physio"
              }`}>
                {b.status === "done" ? "已完成" : b.status === "doing" ? "进行中" : "待开始"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="设备信息" />
        <div className="rounded-2xl bg-card border border-border/60 p-3 text-[12px] space-y-2">
          <Row label="日通量" value={`${device.capacity} 次 / 天`} />
          <Row label="单次时长" value="15–25 分钟" />
          <Row label="上次保养" value={device.lastMaint} />
          <Row label="下次保养" value="2026-06-01（计划）" />
          <Row label="责任工程师" value="工程·赵勇" />
        </div>
      </div>

      <AICard title="AI 维护建议">
        累计运行 <b>148 小时</b>，距推荐保养周期还剩 <b>22 小时</b>，建议安排在本周末停机巡检；近 7 天电流波动 ±0.4A，处于正常范围。
      </AICard>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

/* -------------------- New booking -------------------- */

const NewBookingView = () => {
  const [device, setDevice] = useState(DEVICES[0].code);
  const [slot, setSlot] = useState("10:30");
  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <AICard title="AI 智能推荐">
        基于患者 <b>李大山 · 03-12</b> 的处方（中频电+磁疗），推荐：
        <div className="mt-2 space-y-1.5">
          <div className="text-[12px] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> EMS-01 中频电 · 10:30 · 20min</div>
          <div className="text-[12px] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> MAG-03 磁疗 · 14:30 · 20min</div>
        </div>
      </AICard>

      <div>
        <SectionTitle title="选择设备" />
        <div className="grid grid-cols-2 gap-2">
          {DEVICES.filter((d) => d.status !== "fault" && d.status !== "maintenance").map((d) => (
            <button
              key={d.code}
              onClick={() => setDevice(d.code)}
              className={`text-left rounded-xl border p-2.5 ${
                device === d.code ? "border-role-physio bg-orange-50" : "border-border bg-card"
              }`}
            >
              <div className="text-[12px] font-semibold truncate">{d.name}</div>
              <div className="text-[10px] text-muted-foreground">{d.code}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="选择时段" />
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={`rounded-lg py-2 text-[12px] font-medium ${
                slot === s ? "gradient-physio text-white" : "bg-card border border-border text-foreground/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="患者" />
        <div className="rounded-2xl bg-card border border-border/60 p-3 text-[12px] space-y-2">
          <Row label="床号 · 姓名" value="03-12 李大山" />
          <Row label="处方项" value="中频电刺激（上肢）" />
          <Row label="医师" value="康复·王洁" />
        </div>
      </div>
    </div>
  );
};

/* -------------------- Me -------------------- */

const MeView = () => (
  <div className="px-4 pt-3 pb-6 space-y-4">
    <div className="rounded-3xl gradient-physio text-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">徐</div>
        <div>
          <div className="text-base font-bold">徐建国 · 设备主管</div>
          <div className="text-[11px] opacity-90">理疗中心 · 工号 PT-1024</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Chip n={DEVICES.length} label="管理设备" />
        <Chip n={BOOKINGS.length} label="今日例次" />
        <Chip n={2} label="待处理异常" />
      </div>
    </div>

    <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border/60 overflow-hidden">
      {[
        { icon: ListChecks, label: "我的预约审核", n: 4 },
        { icon: Wrench, label: "维护工单", n: 2 },
        { icon: Sparkles, label: "AI 调度策略" },
        { icon: User, label: "账号与权限" },
      ].map((it, i) => {
        const Icon = it.icon;
        return (
          <button key={i} className="w-full px-3 py-3 flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <Icon className="w-4.5 h-4.5 text-role-physio" />
            </div>
            <div className="flex-1 text-[13px] font-medium">{it.label}</div>
            {typeof it.n === "number" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-destructive text-white font-semibold">{it.n}</span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  </div>
);

export default PhysioApp;
