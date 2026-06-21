import { SidebarProvider } from '../../context/SidebarContext';

export default function DashboardRoute({ children }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
