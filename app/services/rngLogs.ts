import type { RngLogs, BaseApiResponse } from "~/models";

 
export async function getRngLogs(query: object) {
 
    const response = await httpClient<BaseApiResponse<RngLogs>>('rng-logs/get-all', "", { query });
    return response.result;
}