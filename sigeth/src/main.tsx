import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";
import App from "./App.tsx";
import { LangProvider } from "./hooks/useLang";
import { HotelDataProvider } from "./context/HotelDataContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <AuthProvider>
          <HotelDataProvider>
            <App />
          </HotelDataProvider>
        </AuthProvider>
      </LangProvider>
    </QueryClientProvider>
  </StrictMode>,
);
