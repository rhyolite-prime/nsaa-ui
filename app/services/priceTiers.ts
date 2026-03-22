import type { PriceTier, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getPriceTiers(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<PriceTier[]>>>('price-tiers/get-all', "", { query });
    return response.result;
}

export async function createPriceTier(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('price-tiers/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updatePriceTier(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('price-tiers/update', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function deletePriceTier(query: object) {
 
    const response = await httpClient<BaseApiResponse<object>>('price-tiers/delete', "", { query, method: "delete", });
    return response.success;
}