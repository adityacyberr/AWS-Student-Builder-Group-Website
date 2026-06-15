import { redirect } from "next/navigation";

export default function MemberLoginRedirect() {
  redirect("/login?redirectTo=/member");
}
