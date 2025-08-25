export type GameInfo = {
  name: string;
  description: string;
  price: string;
  image: string;
  link: string;
};

export type GameResponse = {
  message: string;
  games: GameInfo[];
  totalPages: number;
};
