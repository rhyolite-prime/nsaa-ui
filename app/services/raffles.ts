import type { Raffle, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getRaffles(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Raffle[]>>>('raffle/get-all', "", { query });
    return response.result;
}

export async function createRaffle(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('raffle/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updateRaffle(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('raffle/update', "", {
    method: "post",
    body: payload,
  });

  return response.success;
}

export async function deleteRaffle(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`raffle/delete?id=${id}`, "", { method: "delete", });
    return response.success;
}