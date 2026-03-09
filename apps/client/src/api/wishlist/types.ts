export type Wishlist = {
  id: string;
  name: string;
  description?: string | null;
  creatorId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WishlistUser = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
};

export type WishlistEntry = {
  id: string;
  wishlistId: string;
  candidateId: string;
  candidate?: WishlistUser;
  createdAt?: string;
  updatedAt?: string;
};

export type WishlistDetails = Wishlist & {
  wishlistEntries: WishlistEntry[];
};
