export type GameInfo = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  // link: string;
  createdAt: string;
  updatedAt: string;
};

export type GameResponse = {
  message: string;
  games: GameInfo[];
  totalPages: number;
};

export type SingleGameResponse = {
  message: string;
  game: GameInfo;
};
