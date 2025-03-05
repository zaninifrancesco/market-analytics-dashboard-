import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold">Market Analytics</h2>
      <nav className="mt-4">
        <ul>
          <li className="py-2 hover:bg-gray-800 px-2 rounded">Home</li>
          <li className="py-2 hover:bg-gray-800 px-2 rounded">News</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
