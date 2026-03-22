import type { Customer, CustomerStats, BaseApiResponse, BasePaginationModel } from "~/models";

 
export async function getCustomers(query: object) {
 
    const response = await httpClient<BaseApiResponse<BasePaginationModel<Customer[]>>>('customers/get-all', "", { query });
    return response.result;
}


export async function getCustomerStats() {
 
    const response = await httpClient<BaseApiResponse<CustomerStats>>('customers/get-stats', "");
    return response.result;
}