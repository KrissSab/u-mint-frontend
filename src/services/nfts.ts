import { API_CONFIG } from "../config/env";
import { api } from "./api";

// Types
export interface CreateNftDto {
  name: string;
  description?: string;
  imageUrl: string;
  collectionId?: string;
  properties?: Record<string, any>;
  royalties?: {
    address: string;
    percentage: number;
  };
  price?: number;
  currency?: string;
  isForSale?: boolean;
  contractAddress: string;
  tokenId: string;
}

export interface Nft {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  creatorId: string;
  collectionId?: string;
  properties?: Record<string, any>;
  royalties?: {
    address: string;
    percentage: number;
  };
  price?: number;
  currency?: string;
  isForSale: boolean;
  mintedOn?: string;
  tokenId: string;
  contractAddress: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// NFTs API
export const nftsApi = {
  // Create a new NFT
  create: async (userId: string, nftData: CreateNftDto): Promise<Nft> => {
    // If there's a collection ID, use the specific endpoint for creating in a collection
    if (nftData.collectionId) {
      const collectionId = nftData.collectionId;
      return api.post<Nft>(
        `/nfts/collection/${collectionId}/user/${userId}`,
        nftData
      );
    }
    return api.post<Nft>(`/nfts/user/${userId}`, nftData);
  },

  // Get all NFTs
  getAll: async (): Promise<Nft[]> => {
    return api.get<Nft[]>("/nfts");
  },

  // Get NFTs by owner
  getByOwner: async (userId: string): Promise<Nft[]> => {
    return api.get<Nft[]>(`/nfts/user/${userId}`);
  },

  // Get NFTs by collection
  getByCollection: async (collectionId: string): Promise<Nft[]> => {
    return api.get<Nft[]>(`/collections/${collectionId}/nfts`);
  },

  // Get a single NFT
  getOne: async (id: string): Promise<Nft> => {
    try {
      return api.get<Nft>(`/nfts/${id}`);
    } catch (error) {
      console.error("Error fetching NFT:", error);
      throw error;
    }
  },

  // Update an NFT
  update: async (
    id: string,
    userId: string,
    updateData: Partial<CreateNftDto>
  ): Promise<Nft> => {
    return api.patch<Nft>(`/nfts/${id}/${userId}`, updateData);
  },

  // Delete an NFT
  delete: async (id: string, userId: string): Promise<void> => {
    return api.delete<void>(`/nfts/${id}/${userId}`);
  },

  // Delete an NFT by token ID and contract address
  deleteByToken: async (
    userId: string,
    tokenId: string,
    contractAddress: string
  ): Promise<void> => {
    return api.delete<void>(
      `/nfts/user/${userId}/${tokenId}/${contractAddress}`
    );
  },

  // Add NFT to collection
  addToCollection: async (
    nftId: string,
    collectionId: string
  ): Promise<Nft> => {
    return api.post<Nft>(`/collections/${collectionId}/nft/${nftId}`, {});
  },

  // Remove NFT from collection
  removeFromCollection: async (
    nftId: string,
    collectionId: string
  ): Promise<Nft> => {
    return api.delete<Nft>(`/collections/${collectionId}/nft/${nftId}`);
  },

  // Blockchain operations
  mintOnBlockchain: async (nftId: string): Promise<Nft> => {
    return api.post<Nft>(`/nfts/blockchain/mint/${nftId}`, {});
  },

  syncWithBlockchain: async (nftId: string): Promise<Nft> => {
    return api.post<Nft>(`/nfts/blockchain/sync/${nftId}`, {});
  },
};

export default nftsApi;
