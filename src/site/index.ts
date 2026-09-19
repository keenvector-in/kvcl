// Tenant website + chatbot configuration — mirrors proto/site/v1/site.proto
// as edge-gateway/tenant-site serialise it (proto field names). Declarative
// data only: closed sets for every enum-like string, no markup, no code.
import type { ThemeFont, ThemeMode } from '../components/ThemeProvider/index';

export interface SiteTheme {
  brand_color: string;
  accent_color: string;
  mode: ThemeMode;
  font: ThemeFont;
}

export type SiteCtaTarget = 'chat' | 'whatsapp' | 'contact';

export interface SiteHero {
  headline: string;
  subheadline: string;
  cta_label: string;
  cta_target: SiteCtaTarget;
  image_url: string;
}

export const siteFeatureIcons = ['sparkles', 'shield', 'zap', 'heart', 'star', 'truck', 'clock', 'phone', 'message', 'check'] as const;
export type SiteFeatureIcon = (typeof siteFeatureIcons)[number];

export interface SiteFeature {
  title: string;
  description: string;
  icon: SiteFeatureIcon;
}

export interface SiteFeatures {
  heading: string;
  items: SiteFeature[];
}

export interface SiteTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface SiteTestimonials {
  heading: string;
  items: SiteTestimonial[];
}

export interface SiteFaqItem {
  question: string;
  answer: string;
}

export interface SiteFaq {
  heading: string;
  items: SiteFaqItem[];
}

export interface SiteContact {
  heading: string;
  phone: string;
  email: string;
  address: string;
  lead_form: boolean;
}

/** Exactly one kind per section (a proto oneof). */
export type SiteSection = { id: string } & (
  | { hero: SiteHero }
  | { features: SiteFeatures }
  | { testimonials: SiteTestimonials }
  | { faq: SiteFaq }
  | { contact: SiteContact }
);

export type SiteSectionKind = 'hero' | 'features' | 'testimonials' | 'faq' | 'contact';

export function sectionKind(section: SiteSection): SiteSectionKind {
  if ('hero' in section) return 'hero';
  if ('features' in section) return 'features';
  if ('testimonials' in section) return 'testimonials';
  if ('faq' in section) return 'faq';
  return 'contact';
}

export type SiteChatAction = '' | 'whatsapp' | 'capture_lead';

export interface SiteChatChoice {
  label: string;
  /** Node to move to; empty ends the branch. */
  next_node_id: string;
  action: SiteChatAction;
}

export interface SiteChatNode {
  id: string;
  message: string;
  choices: SiteChatChoice[];
}

export interface SiteChatbot {
  enabled: boolean;
  bot_name: string;
  /** nodes[0] is where every conversation starts. */
  nodes: SiteChatNode[];
  /** Free-text goes through the tenant's workflows (Web channel) instead of the AI assistant directly. */
  use_workflows: boolean;
}

export interface SiteConfig {
  business_name: string;
  tagline: string;
  logo_url: string;
  /** E.164 digits without '+', used for wa.me hand-off. */
  whatsapp_number: string;
  theme: SiteTheme;
  sections: SiteSection[];
  chatbot: SiteChatbot;
}

export interface Site {
  tenant_id: string;
  slug: string;
  draft: SiteConfig | null;
  published: SiteConfig | null;
  published_at: string;
  updated_at: string;
}

export interface SiteLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
}

export function siteThemeToTenantTheme(t: SiteTheme) {
  return { brandColor: t.brand_color, accentColor: t.accent_color, mode: t.mode, font: t.font };
}
