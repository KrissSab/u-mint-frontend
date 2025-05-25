import { API_CONFIG } from "../config/env";
import { api } from "./api";

// Types
export interface Royalty {
  address: string;
  percentage: number;
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  symbol?: string;
  bannerImage?: string;
  profileImage?: string;
  royalties?: Royalty;
  categories?: string[];
  socialLinks?: Record<string, string>;
}

export interface Collection {
  _id: string;
  name: string;
  description?: string;
  symbol?: string;
  creatorId: string;
  bannerImage?: string;
  profileImage?: string;
  royalties?: Royalty;
  isVerified: boolean;
  totalItems: number;
  totalVolume: number;
  floorPrice: number;
  categories: string[];
  socialLinks?: Record<string, string>;
  isOnSale: boolean;
  createdAt: string;
  updatedAt: string;
}

// Collections API
export const collectionsApi = {
  // Create a new collection
  create: async (
    userId: string,
    collectionData: CreateCollectionDto
  ): Promise<Collection> => {
    return api.post<Collection>(`/collections/${userId}`, collectionData);
  },

  // Get all collections
  getAll: async (): Promise<Collection[]> => {
    return api.get<Collection[]>("/collections");
  },

  // Get collections by creator
  getByCreator: async (creatorId: string): Promise<Collection[]> => {
    return api.get<Collection[]>(`/collections/creator/${creatorId}`);
  },

  // Get a single collection
  getOne: async (id: string): Promise<Collection> => {
    return api.get<Collection>(`/collections/${id}`);
  },

  // Update a collection
  update: async (
    id: string,
    userId: string,
    updateData: Partial<CreateCollectionDto>
  ): Promise<Collection> => {
    return api.patch<Collection>(
      `/collections/update/${id}/${userId}`,
      updateData
    );
  },

  // Delete a collection
  delete: async (id: string, userId: string): Promise<void> => {
    return api.delete<void>(`/collections/delete/${id}/${userId}`);
  },

  // Add NFT to collection
  addNFT: async (collectionId: string, nftId: string): Promise<Collection> => {
    return api.post<Collection>(
      `/collections/${collectionId}/nft/${nftId}`,
      {}
    );
  },

  // Remove NFT from collection
  removeNFT: async (collectionId: string, nftId: string): Promise<void> => {
    return api.delete<void>(`/collections/${collectionId}/remove-nft/${nftId}`);
  },
};

export default collectionsApi;
