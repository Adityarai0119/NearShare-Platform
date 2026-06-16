import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";

// --- Import Pages ---
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import ListItem from "./pages/ListItem";
import MyListings from "./pages/MyListings";
import MyBorrows from "./pages/MyBorrows";
import NotFound from "./pages/NotFound";
import ItemDetails from "./pages/ItemDetails"; 
import ManageRequests from "./pages/ManageRequests"; 
import TransactionDetails from "./pages/TransactionDetails";
import MyPayments from "./pages/MyPayments";
import Wallet from "./pages/Wallet"; // ✅ Wallet Import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* 1. Redirect Root to Browse */}
            <Route path="/" element={<Navigate to="/browse" replace />} />
            <Route path="/index" element={<Navigate to="/browse" replace />} />
            
            {/* 2. Main Public Pages */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/browse" element={<Browse />} />
            
            {/* 3. Provider Features (Lister Side) */}
            <Route path="/list-item" element={<ListItem />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/requests" element={<ManageRequests />} /> 

            {/* 4. Renter Features (Borrower Side) */}
            <Route path="/item/:id" element={<ItemDetails />} /> 
            <Route path="/my-borrows" element={<MyBorrows />} />
            <Route path="/my-payments" element={<MyPayments />} />
            
            {/* 5. Wallet & Financials */}
            <Route path="/wallet" element={<Wallet />} /> {/* ✅ Wallet Route */}
            
            {/* 6. Transaction & Payment Flow */}
            <Route path="/transaction/:id" element={<TransactionDetails />} /> 
            
            {/* 7. Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;