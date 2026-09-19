import type { ComponentProps } from 'react';
import {
  AlertTriangle, ArrowLeft, Banknote, BarChart3, Bell, Box, Calendar, Check, ChevronDown, ChevronRight,
  Clock, Copy, CreditCard, Download, Eye, FileText, Filter, Globe, Heart, Home, Inbox, Info, Layers,
  LayoutGrid, List, LogOut, MapPin, Menu, Minus, Moon, Palette, Pencil, Percent, Phone, Plus, RefreshCw,
  RotateCw, Search, Settings, Share2, Shield, ShoppingCart, Star, Sun, Tag, Trash2, Truck, Undo2, User,
  Users, Wallet, Wrench, X, Zap, type LucideIcon,
} from 'lucide-react';

/**
 * The prototype's icon set, by name (keenplaza-claude/prototype/js/ui.js ICONS).
 * Each name maps to the lucide icon that draws the same glyph, so one icon
 * family serves both products and `<Icon name="cart" />` keeps working.
 */
const ICONS = {
  search: Search, cart: ShoppingCart, heart: Heart, bell: Bell, user: User, pin: MapPin, menu: Menu,
  close: X, chevron: ChevronRight, chevronDown: ChevronDown, back: ArrowLeft, filter: Filter, star: Star,
  plus: Plus, minus: Minus, trash: Trash2, edit: Pencil, copy: Copy, eye: Eye, box: Box, truck: Truck,
  tag: Tag, chart: BarChart3, grid: LayoutGrid, users: Users, settings: Settings, tools: Wrench,
  calendar: Calendar, clock: Clock, check: Check, home: Home, percent: Percent, wallet: Wallet,
  share: Share2, refresh: RefreshCw, download: Download, logout: LogOut, layers: Layers, zap: Zap,
  shield: Shield, rotate: RotateCw, sun: Sun, moon: Moon, alert: AlertTriangle, info: Info, inbox: Inbox,
  globe: Globe, card: CreditCard, palette: Palette, file: FileText, list: List, phone: Phone,
  cash: Banknote, undo: Undo2,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export interface IconProps extends Omit<ComponentProps<LucideIcon>, 'ref'> {
  name: IconName;
  /** px, default 20 */
  size?: number;
  /** Accessible name; omit for decorative icons next to text (they are hidden). */
  label?: string;
}

export function Icon({ name, size = 20, label, ...rest }: IconProps) {
  const Glyph = ICONS[name];
  return <Glyph size={size} strokeWidth={1.7} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false" {...rest} />;
}
