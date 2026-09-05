import './index.css';

// Re-exported so consuming apps depend on a single shared surface for icons and
// routing primitives instead of importing lucide-react/react-router-dom directly.
// react-router-dom's names are listed explicitly (not `export *`) because a few
// collide with lucide-react icon names (e.g. `Route`, `Link`) — an explicit named
// export takes priority over an ambiguous star-export, the icon otherwise wins.
export * from 'lucide-react';
export {
  BrowserRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

export { Badge } from './components/Badge/index';
export type { BadgeProps, BadgeTone } from './components/Badge/index';
export { Button } from './components/Button/index';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/index';
export { Card } from './components/Card/index';
export type { CardProps } from './components/Card/index';
export { Container } from './components/Container/index';
export type { ContainerProps } from './components/Container/index';
export { Input } from './components/Input/index';
export type { InputProps } from './components/Input/index';
