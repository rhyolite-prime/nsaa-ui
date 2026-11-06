import type { HeroSlider, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getHeroSliders(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<HeroSlider[]>>>('cms/hero-sliders/get-all', "", { query });
    return response.result;
}

export async function createHeroSlider(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('cms/hero-sliders/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updateHeroSlider(id: string, payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>(`cms/hero-sliders/update/${id}`, "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function deleteHeroSlider(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`cms/hero-sliders/delete/${id}`, "", { method: "delete", });
    return response.success;
}