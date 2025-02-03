import axios from 'axios';

export interface Flight {
  flightNumber: string;
  airlineCode: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  fareClass: string;
  price: number;
  baggage: number;
}

export interface SearchParams {
  departure: string | null;
  destination: string | null;
  startDate: string | null;
  returnDate: string | null;
  oneWay: string | null;
}

export interface SearchResponse {
  outboundFlights: Flight[];
  returnFlights: Flight[];
  searchParams: {
    departure: string;
    destination: string;
    startDate: string | null;
    returnDate: string | null;
    oneWay: boolean;
  };
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

export const flightService = {
  searchFlights: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await axios.post(`${API_BASE_URL}/search`, params);
    return response.data;
  }
}; 
