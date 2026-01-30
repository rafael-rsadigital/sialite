import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Avaliacao from "./pages/Avaliacao";
import Dashboard from "./pages/Dashboard";
import AdminCadastro from "./pages/AdminCadastro";
import AdminRSA from "./pages/AdminRSA";
import Acesso from "./pages/Acesso";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/av/:slug" element={<Avaliacao />} />
          <Route path="/dashboard/:hash" element={<Dashboard />} />
          <Route path="/admin-cadastro" element={<AdminCadastro />} />
          <Route path="/admin-rsa" element={<AdminRSA />} />
          <Route path="/acesso" element={<Acesso />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
