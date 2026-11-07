/** GradStudio — window.GradStudio. Types are documentation. */
type Node = any;
export interface Booking { code: string; customer: string; pkg: string; price: number; deposit: number; rest: number; date: string; dow: string; requested: string; makeup: { who: string; from: string; to: string }; shoot: { who: string; from: string; to: string; room: string }; }
export interface JourneyStep { id: string; top: string; bottom: string; desc: string; focus: { x: number; y: number; s: number } | null; angle: number | null; }
export interface ButtonProps { variant?: "primary" | "secondary" | "ghost"; size?: "md" | "sm"; block?: boolean; icon?: Node; href?: string; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void; children?: Node; }
export interface PackageChipProps { name?: string; price?: number; cta?: string; onChat?: () => void; }
export interface StepCaptionProps { step: number; steps?: number; top: string; bottom: string; desc?: string; angle?: number; angles?: number; as?: "h1" | "h2" | "h3"; live?: boolean; }
export interface AngleMapProps { items?: JourneyStep[]; current: number; onSelect?: (angle: number, step: JourneyStep) => void; label?: string; }
export interface SetDrawingProps { step?: number; steps?: JourneyStep[]; still?: boolean; reveal?: boolean; revealed?: boolean; photos?: Record<string, { src: string; srcSet?: string; alt: string }>; label?: string; }
export interface PackageCardProps { kicker?: string; name: string; price?: number; priceNote?: string; features?: string[]; addons?: { id: string; label: string; note?: string }[]; addonsChecked?: Record<string, boolean>; selected?: boolean; onSelect?: () => void; onAddons?: (v: Record<string, boolean>) => void; }
export interface BookingSummaryProps { booking?: Partial<Booking>; title?: string; time?: string; badge?: Node; extra?: Node; }
export interface ChatPanelProps { messages?: { who?: string; me?: boolean; text: string; time?: string }[]; onSend?: (text: string) => void; placeholder?: string; sendLabel?: string; height?: number; id?: string; label?: string; }
export interface StatusBadgeProps { tone?: "neutral" | "pending" | "confirmed" | "conflict"; children?: Node; }
export interface ConversationListProps { items: { id: string; name: string; time: string; last: string; status?: StatusBadgeProps["tone"]; unread?: number }[]; activeId?: string; onSelect?: (id: string) => void; }
export interface BookingFormProps { booking?: Partial<Booking>; conflict?: boolean; onSubmit?: () => void; children?: Node; }
export interface ConflictAlertProps { title?: string; children: Node; slots?: { time: string; note: string }[]; picked?: number; onPick?: (slot: { time: string; note: string }, i: number) => void; actions?: Node; }
export interface ResourceScheduleProps { title?: string; start?: number; end?: number; rows: { id: string; name: string; role: string; lanes?: 1 | 2; blocks: { from: string; to: string; label: string; kind?: "busy" | "conflict" | "free" | "proposed"; lane?: 1 | 2 }[] }[]; }
export interface WeekCalendarProps { title?: string; days: { dow: string; num: number; events?: { from: string; to: string; title: string; where: string }[] }[]; selected?: number; onPrev?: () => void; onNext?: () => void; }
export interface DepositCardProps { booking?: Partial<Booking>; percent?: number; paid?: boolean; onPay?: () => void; }
