export type GameInfo = {
  id: string;
  name: string;
  description: string;
  price: string;
  images: image[];
  createdAt: string;
  updatedAt: string;
};

type image = {
  id: string;
  url: string;
  gameId: string;
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
