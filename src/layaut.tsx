import Header from "@/components/Header";
import { Outlet } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";

export default function Layaut() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-4 md:p-6">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}