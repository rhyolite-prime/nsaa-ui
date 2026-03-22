import type { User, UserStats, PermissionResponse, BaseApiResponse, BasePaginationModel } from "~/models";

export async function getUsers(query: object) {
    const response = await httpClient<BaseApiResponse<BasePaginationModel<User[]>>>('users/get-all', "", { query });
    return response.result;
}

export async function getUserStats() {
    const response = await httpClient<BaseApiResponse<UserStats>>('users/get-stats', "");
    return response.result;
}

export async function getPermissions() {
    const response = await httpClient<BaseApiResponse<PermissionResponse>>('users/get-permissions', "");
    return response.result;
}

export async function createUser(payload: object) {
    const response = await httpClient<BaseApiResponse<object>>('users/create', "", {
        method: "post",
        body: payload,
    });
    return response.success;
}

export async function updateUser(payload: object) {
    const response = await httpClient<BaseApiResponse<object>>('users/update', "", {
        method: "post",
        body: payload,
    });
    return response.success;
}

export async function deleteUser(id: string) {
    const response = await httpClient<BaseApiResponse<object>>(`users/delete?id=${id}`, "", { method: "delete" });
    return response.success;
}