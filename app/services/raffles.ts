import type { Raffle, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getRaffles(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Raffle[]>>>('raffle/get-all', "", { query });
    return response.result;
}