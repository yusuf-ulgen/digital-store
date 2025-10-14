// src/components/admin/Guard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDecodedToken, extractRole } from "@/lib/auth"; // '@' alias yoksa: "../../lib/auth"

export default function Guard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const decoded = await getDecodedToken();
      const role = extractRole(decoded);

      if (role === "Admin" || role === "Staff") {
        setAllowed(true);
      } else {
        // token yoksa veya rol uygun değilse
        router.replace("/login");
      }
    })();
  }, [router]);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  return <>{children}</>;
}
