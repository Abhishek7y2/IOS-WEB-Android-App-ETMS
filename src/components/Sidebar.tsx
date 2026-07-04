// ─────────────────────────────────────────────
// components/Sidebar.tsx
//
// The left navigation panel.
// On desktop: always visible.
// On mobile: hidden by default, slides in when isOpen = true.
//
// Props:
//   currentPage  — which page is active (used to highlight the menu item)
//   onPageChange — called when a menu item is clicked
//   isOpen       — whether sidebar is open on mobile
//   onClose      — called to close the sidebar (e.g. when clicking the overlay)
// ─────────────────────────────────────────────

interface SidebarProps {
  currentPage?: string;              // which page is active (default: 'dashboard')
  onPageChange?: (page: string) => void; // optional — called when a nav item is clicked
  isOpen?: boolean;                  // optional — controls mobile visibility
  onClose?: () => void;              // optional — closes sidebar on mobile
}

// Navigation menu items — add more here later
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'tasks',     label: 'Tasks',     icon: '📋' },
];

export default function Sidebar({
  currentPage = 'dashboard', // default to dashboard if not provided
  onPageChange = () => {},   // default to empty function if not provided
  isOpen = false,            // default to closed on mobile
  onClose = () => {},        // default to empty function if not provided
}: SidebarProps) {
  return (
    <>
      {/* ── Mobile overlay (dark background behind sidebar) ──
          Only visible on mobile when sidebar is open.
          Clicking it calls onClose to hide the sidebar. */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ──
          On desktop (md+): always shown, position is normal in the layout.
          On mobile: fixed to the left edge, hidden by default (translate-x-full),
          slides in when isOpen is true (translate-x-0). */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-white border-r border-gray-100
          flex flex-col p-5 transition-transform duration-300
          md:static md:translate-x-0 md:z-auto md:flex
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* ── Close button (mobile only) ── */}
        <div className="flex justify-end mb-4 md:hidden">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* ── Navigation menu ── */}
        <div className="flex-1">
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest m-0 mb-3">
            Menu
          </p>
          <ul className="space-y-1 p-0 list-none m-0">
            {menuItems.map((item) => {
              // Is this the currently active page?
              const isActive = currentPage === item.id;

              return (
                <li key={item.id}>
                  <button
                    id={`nav-${item.id}`}
                    onClick={() => {
                      onPageChange(item.id); // tell App.tsx which page to show
                      onClose();             // close sidebar on mobile after clicking
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium text-left border-0 cursor-pointer transition-all duration-200
                      ${isActive
                        ? 'bg-indigo-50/60 text-indigo-600 font-semibold shadow-sm shadow-indigo-100/50'
                        : 'bg-transparent text-gray-500 hover:bg-gray-50/80 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Help box at the bottom ── */}
        <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100 mt-4 text-left">
          <p className="text-xs font-semibold text-gray-800 m-0">Need assistance?</p>
          <p className="text-[11px] text-gray-500 mt-1 mb-3 leading-relaxed m-0">
            Find details on task flow management in our guides.
          </p>
          <a
            href="#"
            className="inline-flex justify-center items-center w-full px-3 py-2 bg-white text-gray-700 hover:text-gray-900 rounded-xl text-xs font-medium border border-gray-200/80 shadow-sm hover:shadow transition-all duration-200 no-underline"
          >
            Read Docs
          </a>
        </div>

      </aside>
    </>
  );
}
