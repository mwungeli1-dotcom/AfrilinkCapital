"use client";

import { useEffect, useState } from "react";

export default function BuyerOnly({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    let isSupplier = false;
    if (savedUser) {
      try {
        isSupplier = JSON.parse(savedUser)?.role === "supplier";
      } catch {
        isSupplier = false;
      }
    }
    // This synchronizes buyer actions with the authenticated browser role.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!isSupplier);
  }, []);

  return visible ? <>{children}</> : null;
}
