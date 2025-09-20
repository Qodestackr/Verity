import { create } from "zustand";

type MessageRole = "user" | "assistant";
type MessageType = "text" | "event-plan" | "recommendations" | "sports-update";

interface BaseMessage {
  role: MessageRole;
  content: string;
  type?: MessageType;
}

interface EventPlanMessage extends BaseMessage {
  type: "event-plan";
  eventDetails: {
    guestCount: number;
    duration: number;
    eventType: string;
    location: string;
    date: string;
    discount?: string;
  };
  recommendations: {
    category: string;
    items: {
      name: string;
      quantity: number;
      unit: string;
      price: number;
    }[];
  }[];
  totalPrice: number;
}

interface RecommendationsMessage extends BaseMessage {
  type: "recommendations";
  items: {
    name: string;
    image: string;
    description: string;
    price: string;
  }[];
}

interface SportsUpdateMessage extends BaseMessage {
  type: "sports-update";
  match: string;
  content: string;
}

type Message =
  | BaseMessage
  | EventPlanMessage
  | RecommendationsMessage
  | SportsUpdateMessage;

interface StoreState {
  conversation: Message[];
  addMessage: (message: Message) => void;
  addSportsUpdate: (update: SportsUpdateMessage) => void;
  songRequests: string[];
  addSongRequest: (song: string) => void;
}

export const useBaridiAIStore = create<StoreState>((set) => ({
  conversation: [
    {
      role: "assistant",
      content:
        "Woza itisha moja baridi 😉, I'm Baridi, your bartender and event planning assistant. How can I help you today? Need drink recommendations, event planning, or just want to chat about ⚽⚽ and weekend vibes",
    },
  ],
  addMessage: (message) =>
    set((state) => ({
      conversation: [...state.conversation, message],
    })),
  addSportsUpdate: (update) =>
    set((state) => ({
      conversation: [...state.conversation, update],
    })),
  songRequests: [],
  addSongRequest: (song) =>
    set((state) => ({
      songRequests: [...state.songRequests, song],
    })),
}));
