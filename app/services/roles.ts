import type { Role, BaseApiResponse, BasePaginationModel } from "~/models";

export async function getRoles(query: object) {
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Role[]>>>('roles/get-all', "", { query });
    return response.result;
}

export async function getAllRolesForSelect() {
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Role[]>>>('roles/get-all', "", { query: { pageNo: 1, pageSize: 200 } });
    return response.result?.data ?? [];
}

export async function createRole(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('roles/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updateRole(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('roles/update', "", {
    method: "post",
    body: payload,
  });

  return response.success;
}

export async function deleteRole(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`roles/delete?id=${id}`, "", { method: "delete", });
    return response.success;
}