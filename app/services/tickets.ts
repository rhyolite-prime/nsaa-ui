import type { Ticket, TicketStats, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getTickets(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Ticket[]>>>('ticket/get-all', "", { query });
    return response.result;
}

export async function getTicketStats() {
 
    const response = await httpClient<BaseApiResponse<TicketStats>>('ticket/get-stats', "");
    return response.result;
}

export async function getRaffleTicketStats(id: string) {
 
    const response = await httpClient<BaseApiResponse<TicketStats>>(`ticket/get-stats/${id}`, "");
    return response.result;
}

