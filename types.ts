export enum Stage {
  Idle = "Idle",
  IntentDetection = "Intent Detection",
  QueryReformulation = "Smart Query Reformulation",
  LiveSearch = "Live Search & Web Retrieval",
  RAG = "RAG - Semantic Search & Context Refinement",
  AnswerGeneration = "LLM Answer Generation",
  PostProcessing = "Post-Processing & Formatting",
  Done = "Done",
}

// Represents a source from Google Search grounding
export interface Source {
  title: string;
  uri: string;
}

export interface FinalAnswer {
  text: string;
  sources: Source[];
}

export interface SearchHistoryItem {
  id: string;
  created_at: string;
  query: string;
  answer: string;
  sources: Source[];
  user_id: string;
}

export type Database = {
  public: {
    Tables: {
      search_history: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          query: string;
          answer: string;
          sources: Source[];
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          query: string;
          answer: string;
          sources: Source[];
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          query?: string;
          answer?: string;
          sources?: Source[];
        };
      };
    };
    Views: {
      [key: string]: never;
    };
    Functions: {
      [key: string]: never;
    };
    Enums: {
      [key: string]: never;
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};