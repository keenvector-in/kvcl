// Every component carries its own semver in <Name>/version.ts, bumped with its
// CHANGELOG.md. The package version only says "something changed"; this map
// says what — consumers and Storybook can show exactly which component
// versions an app is running.
import { version as AuthLayout } from './components/AuthLayout/version';
import { version as Checkbox } from './components/Checkbox/version';
import { version as ConfirmDialog } from './components/ConfirmDialog/version';
import { version as Drawer } from './components/Drawer/version';
import { version as ErrorBoundary } from './components/ErrorBoundary/version';
import { version as IconButton } from './components/IconButton/version';
import { version as InlineStatus } from './components/InlineStatus/version';
import { version as Modal } from './components/Modal/version';
import { version as PageShell } from './components/PageShell/version';
import { version as Pane } from './components/Pane/version';
import { version as PriceTag } from './components/PriceTag/version';
import { version as ProductCard } from './components/ProductCard/version';
import { version as Radio } from './components/Radio/version';
import { version as SearchBox } from './components/SearchBox/version';
import { version as Select } from './components/Select/version';
import { version as Sidebar } from './components/Sidebar/version';
import { version as Skeleton } from './components/Skeleton/version';
import { version as StatusPill } from './components/StatusPill/version';
import { version as StockBadge } from './components/StockBadge/version';
import { version as Switch } from './components/Switch/version';
import { version as TenantIdDisplay } from './components/TenantIdDisplay/version';
import { version as TextField } from './components/TextField/version';
import { version as Topbar } from './components/Topbar/version';
import { version as AppShell } from './components/AppShell/version';
import { version as Badge } from './components/Badge/version';
import { version as Button } from './components/Button/version';
import { version as Card } from './components/Card/version';
import { version as ColorModeToggle } from './components/ColorModeToggle/version';
import { version as Container } from './components/Container/version';
import { version as DataTable } from './components/DataTable/version';
import { version as EmptyState } from './components/EmptyState/version';
import { version as ErrorState } from './components/ErrorState/version';
import { version as Icon } from './components/Icon/version';
import { version as Input } from './components/Input/version';
import { version as Loader } from './components/Loader/version';
import { version as LogoMark } from './components/LogoMark/version';
import { version as PageHeader } from './components/PageHeader/version';
import { version as RedirectButton } from './components/RedirectButton/version';
import { version as Reveal } from './components/Reveal/version';
import { version as Spinner } from './components/Spinner/version';
import { version as StatCard } from './components/StatCard/version';
import { version as Tabs } from './components/Tabs/version';
import { version as ThemeProvider } from './components/ThemeProvider/version';
import { version as Toast } from './components/Toast/version';
import { version as WorkflowBuilder } from './components/WorkflowBuilder/version';

export const componentVersions = {
  AuthLayout,
  Checkbox,
  ConfirmDialog,
  Drawer,
  ErrorBoundary,
  IconButton,
  InlineStatus,
  Modal,
  PageShell,
  Pane,
  PriceTag,
  ProductCard,
  Radio,
  SearchBox,
  Select,
  Sidebar,
  Skeleton,
  StatusPill,
  StockBadge,
  Switch,
  TenantIdDisplay,
  TextField,
  Topbar,
  AppShell,
  Badge,
  Button,
  Card,
  ColorModeToggle,
  Container,
  DataTable,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  Loader,
  LogoMark,
  PageHeader,
  RedirectButton,
  Reveal,
  Spinner,
  StatCard,
  Tabs,
  ThemeProvider,
  Toast,
  WorkflowBuilder,
} as const;
