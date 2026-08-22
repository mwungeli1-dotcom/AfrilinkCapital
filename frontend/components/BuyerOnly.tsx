"use client";

import { useEffect, useState } from "react";

export default function BuyerOnly({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function syncRole() {
      const savedUser = localStorage.getItem("user");
      let isSupplier = false;
      if (savedUser) {
        try {
          isSupplier = JSON.parse(savedUser)?.role === "supplier";
        } catch {
          isSupplier = false;
        }
      }
      setVisible(!isSupplier);
    }
    // This synchronizes buyer actions with the authenticated browser role.
    syncRole();
    window.addEventListener("session-refreshed", syncRole);
    return () => window.removeEventListener("session-refreshed", syncRole);
  }, []);

  return visible ? <>{children}</> : null;
}
