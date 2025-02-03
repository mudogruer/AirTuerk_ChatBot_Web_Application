import axios from 'axios';
import { Language, LanguageMap } from '../../types/chat';
import { FlightData } from '../../types/flight';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

export interface ChatResponse {
  response: string;
  sessionId: string;
  flightData: FlightData;
  outboundFlights: any[] | null;
  returnFlights: any[] | null;
}

export const chatService = {
  sendMessage: async (
    message: string,
    sessionId: string,
    language: Language
  ): Promise<ChatResponse> => {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message,
      sessionId,
      language: LanguageMap[language]
    });
    return response.data;
  },

  resetChat: async (sessionId: string): Promise<{
    message: string;
    sessionId: string;
    flightData: FlightData;
  }> => {
    const response = await axios.post(`${API_BASE_URL}/reset`, { sessionId });
    return response.data;
  }
}; 
