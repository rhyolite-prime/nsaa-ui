import type { AffiliatePartner, PartnerStats, BaseApiResponse, BasePaginationModel } from "~/models";

export async function getPartners(query: object) {
    const response = await httpClient<BaseApiResponse<BasePaginationModel<AffiliatePartner[]>>>('affiliate-partners/get-all', "", { query });
    return response.result;
}

export async function getPartnerStats() {
    const response = await httpClient<BaseApiResponse<PartnerStats>>('affiliate-partners/get-stats', "");
    return response.result;
}

export async function createPartner(data: Partial<AffiliatePartner>) {
    const response = await httpClient<BaseApiResponse<AffiliatePartner>>('affiliate-partners/create', "POST", { body: data });
    return response.result;
}

export async function updatePartner(id: string, data: Partial<AffiliatePartner>) {
    const response = await httpClient<BaseApiResponse<AffiliatePartner>>(`affiliate-partners/update/${id}`, "PUT", { body: data });
    return response.result;
}

export async function deletePartner(id: string) {
    const response = await httpClient<BaseApiResponse<any>>(`affiliate-partners/delete/${id}`, "DELETE");
    return response;
}
