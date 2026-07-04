// ─────────────────────────────────────────────
// components/Header.tsx
//
// The top bar of the app.
// Shows: logo, app name, hamburger menu (mobile), user info.
//
// Props:
//   onMenuClick — called when the hamburger icon is clicked
//                 (App.tsx uses this to open/close the sidebar on mobile)
// ─────────────────────────────────────────────

interface HeaderProps {
  onMenuClick?: () => void; // optional — only needed for mobile sidebar toggle
}

export default function Header({ onMenuClick = () => {} }: HeaderProps) {
  // onMenuClick defaults to an empty function if not provided
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

      <div className="flex items-center gap-3">

        {/* ── Hamburger button (mobile only) ── */}
        <button
          id="hamburger-menu"
          onClick={onMenuClick}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors md:hidden border border-gray-100"
          aria-label="Toggle sidebar"
        >
          {/* Three lines = hamburger icon */}
          <div className="w-4 h-0.5 bg-current mb-1 rounded-full" />
          <div className="w-4 h-0.5 bg-current mb-1 rounded-full" />
          <div className="w-4 h-0.5 bg-current rounded-full" />
        </button>

        {/* ── App Logo + Name ── */}
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-[0_4px_12px_rgba(79,70,229,0.18)] text-sm tracking-wide">
          TF
        </div>
        <div className="text-left">
          <h2 className="text-sm font-bold text-gray-900 m-0 leading-tight tracking-tight">TaskFlow</h2>
          <p className="text-[10px] text-gray-400 m-0">Employee Task Manager</p>
        </div>

      </div>

      {/* ── User info (right side) ── */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button className="p-2.5 rounded-xl bg-gray-50/80 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors relative border border-gray-100">
          <span className="text-sm leading-none">🔔</span>
          {/* Red dot = unread notification indicator */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User avatar + name */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-100">
            AM
          </div>
          {/* Hidden on very small screens to save space */}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 m-0 leading-none">Alex Morgan</p>
            <p className="text-[9px] font-medium text-gray-400 mt-1 m-0">Manager</p>
          </div>
        </div>

      </div>
    </header>
  );
}
