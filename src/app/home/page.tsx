import { redirect } from "next/navigation";

import { ROUTE_HOME_DASHBOARD } from "@/constants/routes";

export default function HomePage() {
  redirect(ROUTE_HOME_DASHBOARD);
}
