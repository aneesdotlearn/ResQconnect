import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex h-screen bg-base overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-60" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-50" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 bg-accent-50 rounded-full blur-3xl opacity-40" />

      <div className="relative z-10 flex w-full">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((p) => !p)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar sidebarCollapsed={collapsed} />
                    <main
          className="
            relative
            flex-1
            overflow-y-auto
            p-4 md:p-6 lg:p-8

            bg-gradient-to-br
            from-accent-50
            via-base
            to-accent-100
          "
        >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}