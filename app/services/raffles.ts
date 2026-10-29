import type { Raffle, RaffleWinner, RaffleDrawDetails, RaffleDrawResponse, TopTicketHoldersResponse, TopTicketHolder,  BaseApiResponse, BasePaginationModel, Ticket, TicketStats, RngLog } from "~/models";


export async function getRaffles(query: object) {

    const response = await httpClient<BaseApiResponse<BasePaginationModel<Raffle[]>>>('raffle/get-all', "", { query });
    return response.result;
}

export async function getActiveRaffle() {

    const response = await httpClient<BaseApiResponse<Raffle>>('raffle/get-active', "");
    return response.result;
}

export async function getRaffleDrawDetails(id: string) {

    const response = await httpClient<BaseApiResponse<RaffleDrawDetails>>(`raffle/draw-details/${id}`, "");
    return response.result;
}


export async function getRaffleDetails(id: string) {

    const response = await httpClient<BaseApiResponse<any>>(`raffle/details/${id}`, "");
    return response.result;
}


export async function getAllRaffleTickets(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Ticket[]>>>("raffle/get-tickets", "", { query });
    return response.result;
}

export async function getAllRaffleTicketStats(id: string) {
 
    const response = await httpClient<BaseApiResponse<TicketStats>>(`raffle/get-tickets-stats?id=${id}`, "");
    return response.result;
}

export async function getTopTicketHolders(id: string) {
 
    const response = await httpClient<BaseApiResponse<TopTicketHoldersResponse>>(`raffle/get-top-ticket-holders?id=${id}`, "");
    return response.result;
}

export async function getRecentTicketHolders(id: string) {
 
    const response = await httpClient<BaseApiResponse<Raffle>>(`raffle/get-recent-ticket-holders?id=${id}`, "");
    return response.result;
}

export async function createRaffle(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('raffle/create', "", {
    method: "post",
    body: payload,
  });
  return response.success;
}

export async function updateRaffle(payload: object) {
    
  const response = await httpClient<BaseApiResponse<object>>('raffle/update', "", {
    method: "post",
    body: payload,
  });

  return response.success;
}

export async function getRaffleRngLogs(id: string) {
 
    const response = await httpClient<BaseApiResponse<{ data: RngLog[] }>>(`raffle/get-rng-logs?id=${id}`, "");
    return response.result.data;
}

export async function deleteRaffle(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`raffle/delete/${id}`, "", { method: "delete", });
    return response.success;
}

export async function executeDraw(raffleId: string) {
 
    const response = await httpClient<BaseApiResponse<RaffleDrawResponse>>(`raffle/execute-draw/${raffleId}`, "");
    return response.result;
}

//winners
export async function getWinners() {
 
    const response = await httpClient<BaseApiResponse<RaffleWinner>>('rng-logs/get-all', "");
    return response.result;
}