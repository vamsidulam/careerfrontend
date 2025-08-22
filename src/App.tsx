import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp, useUser } from "@clerk/clerk-react";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className={`flex-1 ${showNavbar ? 'mt-[80px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/chat"
            element={
              <>
                <SignedIn>
                  <Chat />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <SignedIn>
                  <Settings />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/sign-in/*"
            element={<SignIn routing="path" path="/sign-in" />}
          />
          <Route
            path="/sign-up/*"
            element={<SignUp routing="path" path="/sign-up" />}
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const { isSignedIn, user } = useUser();
  const lastSyncedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const username = user.username ?? user.fullName ?? user.id;
    const currentKey = `${email}-${username}`;

    if (lastSyncedKeyRef.current === currentKey) return;
    lastSyncedKeyRef.current = currentKey;

    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";
    fetch(`${baseUrl}/users/upsert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username })
    }).catch((err) => {
      console.error("Failed syncing user to backend", err);
    });
  }, [isSignedIn, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
