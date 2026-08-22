import type { PriceCategory, Prize, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getPrizeCategories(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<PriceCategory[]>>>('prize-config/get-all-categories', "", { query });
    return response.result;
}

export async function createPrizeCategory(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('prize-config/create-category', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updatePrizeCategory(id: string, payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>(`prize-config/update-category/${id}`, "", {
    method: "put",
    body: payload,
  });
  return response.success;
}

export async function deletePrizeCategory(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`prize-config/delete-category/${id}`, "", { method: "delete", });
    return response.success;
}


// get all prizes

export async function getPrizes(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Prize[]>>>('prize-config/get-all-prizes', "", { query });
    return response.result;
}

export async function getCategoryPrizes(id: string) {
 
    const response = await httpClient<BaseApiResponse<Prize[]>>(`prize-config/get-category-prizes/${id}`, "");
    return response.result;
}

export async function createPrize(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('prize-config/create-prize', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updatePrize(id: string, payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>(`prize-config/update-prize/${id}`, "", {
    method: "put",
    body: payload,
  });
  return response.success;
}

export async function deletePrize(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`prize-config/delete-prize/${id}`, "", { method: "delete", });
    return response.success;
}