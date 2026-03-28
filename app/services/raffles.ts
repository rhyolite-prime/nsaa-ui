import type { Raffle, RaffleWinner, RaffleDetails, RaffleDrawResponse, TopTicketHolder,  BaseApiResponse, BasePaginationModel, Ticket, TicketStats } from "~/models";


export async function getRaffles(query: object) {

    const response = await httpClient<BaseApiResponse<BasePaginationModel<Raffle[]>>>('raffle/get-all', "", { query });
    return response.result;
}

export async function getActiveRaffle() {

    const response = await httpClient<BaseApiResponse<Raffle>>('raffle/get-active', "");
    return response.result;
}

export async function getRaffleDetails(id: string) {

    const response = await httpClient<BaseApiResponse<RaffleDetails>>(`raffle/get-details?id=${id}`, "");
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
 
    const response = await httpClient<BaseApiResponse<TopTicketHolder[]>>(`raffle/get-top-ticket-holders?id=${id}`, "");
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

export async function getRaffleDrawDetails(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`raffle/delete?id=${id}`, "");
    return response.success;
}

export async function deleteRaffle(id: string) {
 
    const response = await httpClient<BaseApiResponse<object>>(`raffle/delete?id=${id}`, "", { method: "delete", });
    return response.success;
}

export async function executeDraw() {
 
    const response = await httpClient<BaseApiResponse<RaffleDrawResponse>>('raffle/execute-draw', "");
    return response.result;
}

//winners
export async function getWinners() {
 
    const response = await httpClient<BaseApiResponse<RaffleWinner>>('rng-logs/get-all', "");
    return response.result;
}