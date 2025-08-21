import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import React from 'react';
import Navbar from '@/components/Navbar';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';
  return (
    <>
      {showNavbar && <Navbar />}
      <div className={showNavbar ? 'mt-[100px]' : ''}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<div className="min-h-screen bg-background text-foreground p-8">Settings coming soon.</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
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

export default App;
