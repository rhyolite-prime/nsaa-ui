import type { BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getSummary(query: object) {
 
    const response = await httpClient<BaseApiResponse<any>>('reports/summary', "", { query });
    return response.result;
}

export async function getPlayerParticipationLedger(query: object) {
 
    const response = await httpClient<BaseApiResponse<any>>('reports/participation-ledger', "", { query });
    return response.result;
}

export async function getRecentDrawLedger(query: object) {
 
    const response = await httpClient<BaseApiResponse<any>>('reports/draw-ledger', "", { query });
    return response.result;
}