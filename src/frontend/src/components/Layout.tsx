import type { ReactNode } from "react";
import type { View } from "../types";
import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export default function Layout({
  children,
  currentView,
  onNavigate,
  hideHeader,
  hideFooter,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && (
        <Header currentView={currentView} onNavigate={onNavigate} />
      )}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer onNavigate={onNavigate} />}
    </div>
  );
}
