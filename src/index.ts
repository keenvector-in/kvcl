import './index.css';

// Re-exported so consuming apps depend on a single shared surface for icons and
// routing primitives instead of importing lucide-react/react-router-dom directly.
// react-router-dom's names are listed explicitly (not `export *`) because a few
// collide with lucide-react icon names (e.g. `Route`, `Link`) — an explicit named
// export takes priority over an ambiguous star-export, the icon otherwise wins.
export * from 'lucide-react';
// Icons whose lucide name is taken by a kvcl component (Radio, Sidebar) or an
// API type (Store, Warehouse, Icon): re-exported with an `Icon` suffix so apps
// still get them from kvcl instead of a second copy of lucide.
export {
  Radio as RadioIcon,
  Sidebar as SidebarIcon,
  Store as StoreIcon,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
export {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

export { Badge } from './components/Badge/index';
export { Tabs } from './components/Tabs/index';
export type { TabItem, TabsProps } from './components/Tabs/index';
export { apiClient, ApiError, errorMessage } from './api/client';
export type { BadgeProps, BadgeTone } from './components/Badge/index';
export { Button } from './components/Button/index';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/index';
export { Card } from './components/Card/index';
export type { CardProps } from './components/Card/index';
export { Container } from './components/Container/index';
export type { ContainerProps } from './components/Container/index';
export { Input } from './components/Input/index';
export type { InputProps } from './components/Input/index';
export { RedirectButton } from './components/RedirectButton/index';
export type { RedirectButtonProps } from './components/RedirectButton/index';
export { Spinner } from './components/Spinner/index';
export { EmptyState } from './components/EmptyState/index';
export type { EmptyStateProps } from './components/EmptyState/index';
export { ErrorState } from './components/ErrorState/index';
export type { ErrorStateProps } from './components/ErrorState/index';
export { ToastProvider, useToast, toast, Toaster } from './components/Toast/index';
export type { ToastTone, ToastType, ToastOptions } from './components/Toast/index';
export { DataTable } from './components/DataTable/index';
export type { DataTableColumn, DataTableProps } from './components/DataTable/index';
export { AppShell } from './components/AppShell/index';
export { ColorModeToggle, applyStoredColorMode, useColorMode } from './components/ColorModeToggle/index';
export type { ColorMode, ColorModeToggleProps } from './components/ColorModeToggle/index';
export type { AppShellProps, AppShellNavItem } from './components/AppShell/index';
export { WorkflowBuilder } from './components/WorkflowBuilder/index';
export type { WorkflowBuilderProps, WorkflowEdge, WorkflowGraph, WorkflowNode } from './components/WorkflowBuilder/index';
export { NodeConfigPanel } from './components/WorkflowBuilder/NodeConfigPanel';
export type { NodeConfigPanelProps } from './components/WorkflowBuilder/NodeConfigPanel';
export { workflowNodeCatalog, workflowNodeGroups, workflowChannels } from './components/WorkflowBuilder/catalog';
export type { WorkflowChannel } from './components/WorkflowBuilder/catalog';
export type {
  WorkflowField,
  WorkflowFieldOption,
  WorkflowNodeKind,
  WorkflowNodeSpec,
} from './components/WorkflowBuilder/catalog';

export { PageHeader } from './components/PageHeader/index';
export type { PageHeaderProps } from './components/PageHeader/index';
export { StatCard } from './components/StatCard/index';
export type { StatCardProps } from './components/StatCard/index';
export { Reveal } from './components/Reveal/index';
export type { RevealProps } from './components/Reveal/index';
export { ThemeProvider, defaultTheme, isHexColor, themeFonts, themeStyle } from './components/ThemeProvider/index';
export type { TenantTheme, ThemeFont, ThemeMode, ThemeProviderProps } from './components/ThemeProvider/index';
/* ---- KeenPlaza: brand mark, named icon set, gateway clients, store theme ----
 * The commerce half of the library (ex-bzcl). Components live beside the rest
 * in src/components; these are the non-component modules. */
export { Icon, ICON_NAMES } from './components/Icon/index';
export type { IconName, IconProps } from './components/Icon/index';
export { LogoMark, Wordmark } from './components/LogoMark/index';
export type { LogoMarkProps, LogoMarkVariant, WordmarkProps } from './components/LogoMark/index';
export { Loader } from './components/Loader/index';
export type { LoaderProps } from './components/Loader/index';

export { createHttpClient, setTokens, clearTokens, isLoggedIn, onSessionLost } from './api/httpClient';
export type { HttpClient, RequestOptions } from './api/httpClient';
export { identityApi, deviceInfo } from './api/identity';
export type { TokenPair, OtpRequestResponse, ForgotPasswordResponse, Session, Me } from './api/identity';
export { tenantApi } from './api/tenant';
export type { Tenant, Store, Membership, FeatureFlag, TenantStatus, MembershipStatus, CallerPermissions, MemberTenant } from './api/tenant';
export { storefrontApi } from './api/storefront';
export type { Storefront, StoreContent, TenantDomain } from './api/storefront';
export { catalogApi } from './api/catalog';
export type { Brand, Category, Product, Variant, ProductStatus, VariantStatus, CategoryStatus, Attribute, AttributeDataType, AttributeStatus, AttributeInput, ProductSpec, ProductInput, VariantInput, CategoryInput } from './api/catalog';
export { pricingApi } from './api/pricing';
export type { PriceBreakdown, PriceList, Offer, OfferInput, OfferTarget, OfferTargetType, OfferStatus, DiscountType, ShippingMethod, Coupon, TaxRule } from './api/pricing';
export { inventoryApi } from './api/inventory';
export type { Warehouse, WarehouseInput, StockAvailability, StockStatus, StockSummary, StockSettings, WarehouseStock, AdjustReason, LedgerEntry } from './api/inventory';
export { cartApi } from './api/cart';
export type { Cart, CartLine, CartStatus, CartSummary, CartView } from './api/cart';
export { searchApi } from './api/search';
export type { SearchHit, FacetCount, SearchResult } from './api/search';
export { notificationApi, NOTIFY_EVENTS, NOTIFY_PLACEHOLDERS } from './api/notification';
export type { NotifyTemplate, NotifyDelivery, NotifyChannel, NotifyEvent, DeliveryStatus, Campaign, CampaignStatus } from './api/notification';
export { mediaApi, mediaSrcSet, mainImage } from './api/media';
export type { MediaAsset, MediaOwnerType, MediaSize } from './api/media';
export { customerApi } from './api/customer';
export type { CustomerProfile, Consent, Customer, CustomerDetail, CustomerSort, Address, AddressInput, Segment, SegmentFilter } from './api/customer';
export { orderApi, logisticsApi, NEXT_ORDER_STATUSES, NEXT_SHIPMENT_STATUSES } from './api/order';
export type { Order, OrderLine, OrderOffer, OrderStatus, CheckoutInput, OrderStatusChange, OrderPayment, Shipment, ShipmentStatus, TrackingEvent, CourierAccount, BlueDartInput } from './api/order';
export { platformApi, leadsApi, PLATFORM_FLAGS } from './api/platform';
export type { AuditEntry, Lead, LeadInput } from './api/platform';
export { paymentApi } from './api/payment';
export type { PaymentAccount, PaymentMode } from './api/payment';

export { brandColors, radius, shadow, motion, fontFamily, placeholderImage } from './tokens/brand';
export { THEME_PRESETS, DEFAULT_THEME, isValidTheme, themeVariables } from './tokens/storeTheme';
export type { StoreTheme } from './tokens/storeTheme';

/* ---- merged-in KeenPlaza components ---------------------------------- */
export { TextField, TextArea } from './components/TextField/index';
export type { TextFieldProps, TextAreaProps } from './components/TextField/index';
export { Select } from './components/Select/index';
export type { SelectProps, SelectOption } from './components/Select/index';
export { Checkbox } from './components/Checkbox/index';
export type { CheckboxProps } from './components/Checkbox/index';
export { Radio } from './components/Radio/index';
export type { RadioProps } from './components/Radio/index';
export { Switch } from './components/Switch/index';
export type { SwitchProps } from './components/Switch/index';
export { SearchBox } from './components/SearchBox/index';
export type { SearchBoxProps } from './components/SearchBox/index';
export { Modal } from './components/Modal/index';
export type { ModalProps } from './components/Modal/index';
export { Drawer } from './components/Drawer/index';
export type { DrawerProps } from './components/Drawer/index';
export { ConfirmDialog } from './components/ConfirmDialog/index';
export type { ConfirmDialogProps } from './components/ConfirmDialog/index';
export { InlineStatus } from './components/InlineStatus/index';
export {
  PasswordLoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  ChangePasswordForm,
  LoginDetailsPanel,
  SessionsList,
  MIN_PASSWORD_LENGTH,
} from './components/PasswordAuth/index';
export type {
  PasswordLoginFormProps,
  RegisterFormProps,
  ForgotPasswordFormProps,
  ResetPasswordFormProps,
  ChangePasswordFormProps,
  LoginDetailsPanelProps,
  SessionsListProps,
} from './components/PasswordAuth/index';
export type { InlineStatusProps, InlineStatusKind } from './components/InlineStatus/index';
export { Skeleton } from './components/Skeleton/index';
export type { SkeletonProps } from './components/Skeleton/index';
export { Sidebar } from './components/Sidebar/index';
export type { SidebarProps, SidebarGroup, SidebarItem } from './components/Sidebar/index';
export { Topbar } from './components/Topbar/index';
export type { TopbarProps } from './components/Topbar/index';
export { PageShell } from './components/PageShell/index';
export type { PageShellProps } from './components/PageShell/index';
export { Pane } from './components/Pane/index';
export type { PaneProps } from './components/Pane/index';
export { AuthLayout } from './components/AuthLayout/index';
export type { AuthLayoutProps, AuthBenefit } from './components/AuthLayout/index';
export { TenantIdDisplay } from './components/TenantIdDisplay/index';
export type { TenantIdDisplayProps } from './components/TenantIdDisplay/index';
export { ErrorBoundary } from './components/ErrorBoundary/index';
export type { ErrorBoundaryProps } from './components/ErrorBoundary/index';
export { IconButton } from './components/IconButton/index';
export type { IconButtonProps } from './components/IconButton/index';
export { StatusPill } from './components/StatusPill/index';
export type { StatusPillProps, PillTone } from './components/StatusPill/index';
export { StockBadge } from './components/StockBadge/index';
export type { StockBadgeProps, StockBadgeStatus } from './components/StockBadge/index';
export { PriceTag } from './components/PriceTag/index';
export type { PriceTagProps } from './components/PriceTag/index';
export { Timeline } from './components/Timeline/index';
export type { TimelineProps, TimelineEntry } from './components/Timeline/index';
export { DescriptionList } from './components/DescriptionList/index';
export type { DescriptionListProps, DescriptionItem } from './components/DescriptionList/index';
export { Chip } from './components/Chip/index';
export type { ChipProps } from './components/Chip/index';
export { ScrollRail } from './components/ScrollRail/index';
export type { ScrollRailProps } from './components/ScrollRail/index';
export { QuantityStepper } from './components/QuantityStepper/index';
export type { QuantityStepperProps } from './components/QuantityStepper/index';
export { flyToCart } from './lib/flyToCart';
export { ProductCard } from './components/ProductCard/index';
export type { ProductCardProps } from './components/ProductCard/index';
export { useOverlay } from './hooks/useOverlay';
export { formatMinor } from './lib/money';
export * from './lib/validate';

export { componentVersions } from './versions';

export * from './site/index';

export { AuthProvider, useAuth, ProtectedRoute } from './auth/index';
export type { AuthUser, Role } from './auth/index';
