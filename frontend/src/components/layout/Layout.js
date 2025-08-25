// src/components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

function Layout() {
  return (
    <div>
      <AppNavbar />
      <main className="py-4">
        <Outlet />
      </main>
    </div>
  );
}
export default Layout;