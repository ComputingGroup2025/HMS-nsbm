import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, user }) => {
  return (
    <div className="layout">
      <Navbar user={user} />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2026 Hostel Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
