import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

import { Button } from "@modulus/ui";

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <ShieldX className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Access Denied</h1>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        Your account does not have permission to view this section. Contact your administrator if you believe this is an error.
      </p>
      <Button variant="outline" size="sm" onClick={() => { void navigate(-1); }}>
        Go back
      </Button>
    </div>
  );
}
