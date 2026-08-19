import type { PriceCategory, Prize, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getPrizeCategories(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<PriceCategory[]>>>('price-config/get-all-categories', "", { query });
    return response.result;
}

export async function createPrizeCategory(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('price-config/create-category', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updatePrizeCategory(id: string, payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>(`price-config/update-category/${id}`, "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function deletePrizeCategory(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`price-config/delete-category/${id}`, "", { method: "delete", });
    return response.success;
}


// get all prizes

export async function getPrizes(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Prize[]>>>('price-config/get-all-prizes', "", { query });
    return response.result;
}

export async function createPrize(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('price-config/create-prizes', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updatePrize(id: string, payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>(`price-config/update-prizes/${id}`, "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function deletePrize(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`price-config/delete-prizes/${id}`, "", { method: "delete", });
    return response.success;
}