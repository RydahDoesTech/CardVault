export type CardCondition =
  | 'Near Mint'
  | 'Lightly Played'
  | 'Moderately Played'
  | 'Heavily Played'
  | 'Damaged';

export type CardGame = 'pokemon' | string;

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

export interface CatalogCard {
  id: string;
  external_card_id: string;
  game: string;
  name: string;
  set_name: string | null;
  card_number: string | null;
  rarity: string | null;
  image_url: string | null;
  created_at: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
  condition: string;
  quantity: number;
  purchase_price: number | null;
  estimated_value: number | null;
  notes: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  last_price_update: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceHistoryRow {
  id: string;
  user_card_id: string;
  source: string;
  low_price: number | null;
  average_price: number | null;
  high_price: number | null;
  market_price: number | null;
  checked_at: string;
}

/** Row shape for list/detail queries with joined catalog card */
export interface UserCardWithCatalog extends UserCard {
  cards: CatalogCard | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      cards: {
        Row: CatalogCard;
        Insert: Omit<CatalogCard, 'id' | 'created_at'> & { id?: string };
        Update: Partial<CatalogCard>;
      };
      user_cards: {
        Row: UserCard;
        Insert: Omit<UserCard, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<UserCard>;
      };
      price_history: {
        Row: PriceHistoryRow;
        Insert: Omit<PriceHistoryRow, 'id'> & { id?: string };
        Update: Partial<PriceHistoryRow>;
      };
    };
  };
}
