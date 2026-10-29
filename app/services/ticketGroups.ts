import type { TicketGroup, BaseApiResponse, BasePaginationModel } from "~/models";

export async function getTicketGroups(query: object = {}) {
    const response = await httpClient<BaseApiResponse<BasePaginationModel<TicketGroup[]>>>('ticket-group/get-all', "", { query });
    return response.result;
}

export async function createTicketGroup(payload: Partial<TicketGroup>) {
  const response = await httpClient<BaseApiResponse<object>>('ticket-group/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updateTicketGroup(id: string, payload: object) {
  const response = await httpClient<BaseApiResponse<object>>(`ticket-group/update/${id}`, "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function deleteTicketGroup(id: string) {
    const response = await httpClient<BaseApiResponse<object>>(`ticket-group/delete/${id}`, "", { method: "delete" });
    return response.success;
}
