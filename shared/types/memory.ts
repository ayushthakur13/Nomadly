export interface Memory {
  _id: string;
  tripId: string;
  uploadedBy: {
    _id: string;
    username: string;
    email?: string;
    profilePicUrl?: string | null;
  };
  url: string;
  publicId?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemoryPayload {
  caption?: string;
}

export interface UpdateMemoryPayload {
  caption: string;
}
