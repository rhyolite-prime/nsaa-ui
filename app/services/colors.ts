import type { Colour, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getColours(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Colour[]>>>('colours/get-all', "", { query });
    return response.result;
}

export async function createColour(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('colours/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updateColour(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('colours/update', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function deleteColour(query: object) {
 
    const response = await httpClient<BaseApiResponse<object>>('colours/delete', "", { query, method: "delete", });
    return response.success;
}