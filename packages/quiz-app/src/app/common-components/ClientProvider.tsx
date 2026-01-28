// src/app/common-components/ClientProviders.tsx
"use client";

import React, { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { UtilsProvider } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";
import { getComputer } from "./Auth";
import { Computer } from "@bitcoin-computer/lib";
import dynamic from "next/dynamic";

const Wallet = dynamic(() => import("./Wallet").then((mod) => mod.Wallet), {
  ssr: false,
});

const Navbar = dynamic(() => import("./Navbar").then((mod) => mod.Navbar), {
  ssr: false,
});

const LoginModal = dynamic(
  () => import("./Auth").then((mod) => mod.Auth.LoginModal),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [computer, setComputer] = useState<Computer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize computer immediately on mount
  useEffect(() => {
    const initializeComputer = async () => {
      if (typeof window === "undefined") return;
      
      const hasKey = !!localStorage.getItem("BIP_39_KEY");
      console.log("ClientProvider - initializing with wallet:", hasKey);
      
      if (hasKey) {
        try {
          const newComputer = getComputer();
          console.log("ClientProvider - computer created with address:", newComputer.getAddress());
          setComputer(newComputer);
        } catch (error) {
          console.error("ClientProvider - error creating computer:", error);
          setComputer(null);
        }
      } else {
        setComputer(null);
      }
      setIsInitialized(true);
    };

    initializeComputer();
  }, []); // Empty dependency array - run only once on mount
  
  // Monitor auth changes and re-initialize computer when needed
  useEffect(() => {
    const initializeComputer = () => {
      if (typeof window === "undefined") return;
      
      console.log("ClientProvider - reinitializing...");
      const hasKey = !!localStorage.getItem("BIP_39_KEY");
      console.log("ClientProvider - has BIP_39_KEY:", hasKey);
      
      try {
        if (hasKey) {
          const newComputer = getComputer();
          console.log("ClientProvider - computer recreated successfully", newComputer);
          setComputer(newComputer);
        } else {
          console.log("ClientProvider - no wallet key found, clearing computer");
          setComputer(null);
        }
      } catch (error) {
        console.error("ClientProvider - error creating computer:", error);
        setComputer(null);
      }
    };

    // Listen for auth state changes
    const handleAuthChange = () => {
      console.log("ClientProvider - auth change detected, reinitializing...");
      setTimeout(initializeComputer, 50);
    };

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "BIP_39_KEY") {
        console.log("ClientProvider - wallet key change detected");
        setTimeout(initializeComputer, 50);
      }
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Log context state
  useEffect(() => {
    console.log("ClientProvider - context state:", {
      hasComputer: !!computer,
      isInitialized,
      hasWalletKey: typeof window !== "undefined" ? !!localStorage.getItem("BIP_39_KEY") : false,
      computerInstance: computer,
      computerType: typeof computer,
      computerAddress: computer ? computer.getAddress() : 'N/A'
    });
  }, [computer, isInitialized]);

  useEffect(() => {
    // Initialize Flowbite after a small delay to ensure all components are mounted
    const initializeFlowbite = () => {
      try {
        initFlowbite();
        console.log("ClientProvider - Flowbite initialized");
      } catch (error) {
        console.warn("ClientProvider - Flowbite initialization warning:", error);
      }
    };
    
    setTimeout(initializeFlowbite, 100);
  }, []);

  // Show loading state until initialized to ensure computer is ready
  if (!isInitialized) {
    return (
      <UtilsProvider>
        <ComputerContext.Provider value={null}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </ComputerContext.Provider>
      </UtilsProvider>
    );
  }

  return (
    <UtilsProvider>
      <ComputerContext.Provider value={computer}>
        <LoginModal />
        <Wallet />
        <Navbar />
        <div className="m-4 bg-gray-100 dark:bg-gray-800">{children}</div>
      </ComputerContext.Provider>
    </UtilsProvider>
  );
}
