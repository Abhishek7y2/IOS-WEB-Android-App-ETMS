import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "../styles/globals.css";
import { TaskProvider } from "../context/TaskContext";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { CommunicationProvider } from "../context/CommunicationContext";
import { ChatProvider } from "../context/ChatContext";
import { NotificationProvider } from "../context/NotificationContext";
import { LayoutGuard } from "../components/LayoutGuard";
import MockAuthBanner from "../components/MockAuthBanner";
import QueryProvider from "../providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Employee Task Manager",
  description: "A production-ready dashboard for tracking employee task work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
        <QueryProvider>
          <AuthProvider>
            <TaskProvider>
              <ThemeProvider>
                <CommunicationProvider>
                  <ChatProvider>
                    <NotificationProvider>
                      <LayoutGuard>
                        {children}
                      </LayoutGuard>
                      <Toaster richColors position="top-right" closeButton />
                      <MockAuthBanner />
                    </NotificationProvider>
                  </ChatProvider>
                </CommunicationProvider>
              </ThemeProvider>
            </TaskProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

