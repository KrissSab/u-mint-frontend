import { API_CONFIG } from "../config/env";
import { api } from "./api";

// Types
export interface CreateSaleDto {
  nftId: string;
  price: number;
  currency: string;
  isAuction?: boolean;
  endDate?: string;
  minimumBid?: number;
  reservePrice?: number;
}

export interface Bid {
  _id: string;
  buyerId: string;
  saleId: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface Sale {
  _id: string;
  nftId: string;
  sellerId: string;
  buyerId?: string;
  collectionId?: string;
  price: number;
  currency: string;
  isAuction: boolean;
  endDate?: string;
  minimumBid?: number;
  reservePrice?: number;
  status: "active" | "completed" | "cancelled";
  bids?: Bid[];
  highestBid?: Bid;
  createdAt: string;
  updatedAt: string;
}

// Sales API
export const salesApi = {
  // Create a new sale
  create: async (userId: string, saleData: CreateSaleDto): Promise<Sale> => {
    return api.post<Sale>(`/sales/${userId}`, saleData);
  },

  // Get all sales
  getAll: async (): Promise<Sale[]> => {
    return api.get<Sale[]>("/sales");
  },

  // Get sales by collection
  getByCollection: async (collectionId: string): Promise<Sale[]> => {
    return api.get<Sale[]>(`/sales/collection/${collectionId}`);
  },

  // Get sales by seller
  getBySeller: async (sellerId: string): Promise<Sale[]> => {
    return api.get<Sale[]>(`/sales/seller/${sellerId}`);
  },

  // Get sales by buyer
  getByBuyer: async (buyerId: string): Promise<Sale[]> => {
    return api.get<Sale[]>(`/sales/buyer/${buyerId}`);
  },

  // Get a single sale
  getOne: async (id: string): Promise<Sale> => {
    return api.get<Sale>(`/sales/${id}`);
  },

  // Update a sale
  update: async (
    id: string,
    userId: string,
    updateData: Partial<CreateSaleDto>
  ): Promise<Sale> => {
    return api.patch<Sale>(`/sales/${id}/${userId}`, updateData);
  },

  // Cancel a sale
  cancel: async (id: string, userId: string): Promise<void> => {
    return api.delete<void>(`/sales/${id}/${userId}`);
  },

  // Buy an NFT
  buy: async (id: string, buyerId: string): Promise<Sale> => {
    return api.post<Sale>(`/sales/${id}/buy/${buyerId}`, {});
  },

  // Place a bid
  placeBid: async (
    buyerId: string,
    bidData: { saleId: string; amount: number; currency: string }
  ): Promise<Bid> => {
    return api.post<Bid>(`/sales/bid/${buyerId}`, bidData);
  },

  // End an auction
  endAuction: async (id: string, userId: string): Promise<Sale> => {
    return api.post<Sale>(`/sales/${id}/end-auction/${userId}`, {});
  },

  // Blockchain operations
  listOnBlockchain: async (saleId: string): Promise<Sale> => {
    return api.post<Sale>(`/sales/blockchain/list/${saleId}`, {});
  },

  buyOnBlockchain: async (saleId: string, buyerId: string): Promise<Sale> => {
    return api.post<Sale>(`/sales/blockchain/buy/${saleId}/${buyerId}`, {});
  },

  cancelOnBlockchain: async (saleId: string): Promise<Sale> => {
    return api.post<Sale>(`/sales/blockchain/cancel/${saleId}`, {});
  },
};

export default salesApi;
