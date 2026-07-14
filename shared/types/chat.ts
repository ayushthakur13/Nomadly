export interface ChatMessage {
  _id: string;
  trip: string;
  sender: {
    _id: string;
    username: string;
    profilePicUrl?: string | null;
  };
  content: string;
  createdAt: string;
}

export interface SendMessagePayload {
  content: string;
}
