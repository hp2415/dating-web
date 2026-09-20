import type { ReactNode } from "react";
import { hasPerm } from "../auth/session";

/** Hide children unless admin has perm or * */
export default function Can({ perm, children }: { perm: string; children: ReactNode }) {
  if (hasPerm(perm)) {
    return <>{children}</>;
  }
  return null;
}
