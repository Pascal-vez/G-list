import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('glist_sidebar_collapsed') === 'true',
  );

  useEffect(() => {
    localStorage.setItem('glist_sidebar_collapsed', collapsed.toString());
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed((c) => !c);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
