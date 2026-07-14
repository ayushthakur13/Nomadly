import api from './api';
import type { ChatMessage } from '../../../shared/types';

export const chatService = {
  /**
   * Fetch historical messages for a trip with cursor pagination
   */
  async fetchChatHistory(
    tripId: string,
    limit?: number,
    beforeDate?: string
  ): Promise<ChatMessage[]> {
    const params: Record<string, any> = {};
    if (limit !== undefined) params.limit = limit;
    if (beforeDate) params.beforeDate = beforeDate;

    const response = await api.get(`/trips/${tripId}/chat/messages`, { params });
    return response.data.data.messages;
  },
};

export default chatService;
