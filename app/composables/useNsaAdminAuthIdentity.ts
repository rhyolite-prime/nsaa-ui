import type { NsaAdminAuthModel } from "~/models";

export const useNsaAdminAuthIdentity = () => {
  
  const nsaAdminIdentityCookie = useCookie("nsa-admin-identity");

  return useState("nsaAuth", () => nsaAdminIdentityCookie.value as string);
};