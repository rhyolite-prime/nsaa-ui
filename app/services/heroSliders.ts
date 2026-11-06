import type { HeroSlider, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getHeroSliders(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<HeroSlider[]>>>('cms/hero-sliders/get-all', "", { query });
    return response.result;
}

/**
 * Creates a hero slider.
 *
 * The payload is a multipart/form-data body: the slide image travels with the
 * record as the `image` file attachment, the api uploads it to cloudinary and
 * stores the returned url on the slide (so no `imageUrl` is ever sent).
 */
export async function createHeroSlider(payload: FormData) {
    
  const response = await httpClient<BaseApiResponse<object>>('cms/hero-sliders/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

/**
 * Updates a hero slider.
 *
 * The payload is a multipart/form-data body, every field is optional and only
 * the supplied ones are changed. The `image` file attachment replaces the
 * stored image, when it is omitted the current image is kept.
 */
export async function updateHeroSlider(id: string, payload: FormData) {
    
  const response = await httpClient<BaseApiResponse<object>>(`cms/hero-sliders/update/${id}`, "", {
    method: "put",
    body: payload,
  });
  return response.success;
}

export async function deleteHeroSlider(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`cms/hero-sliders/delete/${id}`, "", { method: "delete", });
    return response.success;
}
