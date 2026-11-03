import type {
    BaseApiResponse,
    DashboardSummary,
    TicketDistribution,
} from "~/models";

export async function getSummary(query: object = {}): Promise<DashboardSummary> {

    const response = await httpClient<BaseApiResponse<DashboardSummary>>('reports/summary', "", { query });
    return response.result;
}

export async function getTicketDistribution(query: object = {}): Promise<TicketDistribution> {

    const response = await httpClient<BaseApiResponse<TicketDistribution>>('reports/ticket-distribution', "", { query });
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
