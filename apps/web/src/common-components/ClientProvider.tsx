// // src/app/common-components/ClientProviders.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import { initFlowbite } from "flowbite";
// import { UtilsProvider } from "./UtilsContext";
// import { ComputerContext } from "./ComputerContext";
// import { getComputer } from "./Auth";
// import { Computer } from "@bitcoin-computer/lib";
// import dynamic from "next/dynamic";

// const Wallet = dynamic(() => import("./Wallet").then((mod) => mod.Wallet), {
//   ssr: false,
// });

// const Navbar = dynamic(() => import("./Navbar").then((mod) => mod.Navbar), {
//   ssr: false,
// });

// const LoginModal = dynamic(
//   () => import("./Auth").then((mod) => mod.Auth.LoginModal),
//   { ssr: false }
// );

// export function ClientProviders({ children }: { children: React.ReactNode }) {
//   const [computer, setComputer] = useState<Computer | null>(null);
  
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       // Initialize SES lockdown before creating Computer instance
//       // This is required for deployed contracts to work properly
//       try {
//         Computer.lockdown({
//           consoleTaming: 'unsafe',
//           errorTaming: 'unsafe',
//           mathTaming: 'unsafe',
//           dateTaming: 'unsafe',
//           overrideTaming: 'severe',
//         });
//         console.log('✅ SES lockdown initialized');
//       } catch (error: any) {
//         // Lockdown might already be called, which is fine
//         if (!error.message?.includes('already called')) {
//           console.warn('⚠️ SES lockdown warning:', error.message);
//         }
//       }
      
//       // Create Computer instance after lockdown
//       const comp = getComputer();
//       setComputer(comp);
//       console.log('✅ Computer instance created');
//     }
//   }, []);

//   useEffect(() => {
//     initFlowbite();
//   }, []);

//   return (
//     <UtilsProvider>
//       <ComputerContext.Provider value={computer}>
//         {computer ? (
//           <>
//             <LoginModal />
//             <Wallet />
//             <Navbar />
//             <div className="m-4 bg-gray-100 dark:bg-gray-800">{children}</div>
//           </>
//         ) : (
//           <></>
//         )}
//       </ComputerContext.Provider>
//     </UtilsProvider>
//   );
// }


// src/app/common-components/ClientProvider.tsx
"use client";

import React, { useEffect, useRef, useState, startTransition } from "react";
import { Computer } from "@bitcoin-computer/lib";
import { ComputerContext } from "./ComputerContext";
import { getComputer } from "./Auth";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [computer, setComputer] = useState<Computer | null>(null);
  const computerRef = useRef<Computer | null>(null);

  useEffect(() => {
    // Avoid double init during dev / fast refresh
    if (computerRef.current) return;

    const c = getComputer();
    computerRef.current = c;

    // Avoid "setState synchronously within an effect" warning in newer React/Next overlays
    startTransition(() => setComputer(c));
  }, []);

  if (!computer) return null;

  // IMPORTANT: ComputerContext expects Computer | null (NOT { computer: ... })
  return <ComputerContext.Provider value={computer}>{children}</ComputerContext.Provider>;
}

// So default import also works if you ever switch to it
export default ClientProviders;