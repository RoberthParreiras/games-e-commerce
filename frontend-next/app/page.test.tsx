import { render, screen } from "@testing-library/react";

import Home from "./page";
import { getGames } from "@/app/lib/game-data";

jest.mock("@/app/lib/game-data", () => ({
  getGames: jest.fn(),
}));

jest.mock("embla-carousel-react", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue([
    jest.fn(),
    {
      canScrollPrev: jest.fn().mockReturnValue(false),
      canScrollNext: jest.fn().mockReturnValue(false),
      on: jest.fn(),
      off: jest.fn(),
    },
  ]),
}));

jest.mock("@/app/components/gameCardHome", () => ({
  GameCardHome: jest.fn(({ game }) => (
    <div data-testid="game-card">{game.name}</div>
  )),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    const { fill, ...rest } = props;

    return <img {...rest} />;
  },
}));

const mockGetGames = getGames as jest.Mock;

describe("Home Page", () => {
  it("should render headings, about section, and games list", async () => {
    const mockGames = {
      games: [
        { id: "1", name: "Game One", price: 59.99, image_url: "/game1.jpg" },
        { id: "2", name: "Game Two", price: 49.99, image_url: "/game2.jpg" },
      ],
    };
    mockGetGames.mockResolvedValue(mockGames);

    // The component is async, so we need to await its resolution before rendering
    const Page = await Home();
    render(Page);

    expect(
      screen.getByRole("heading", {
        name: /discover and play thousands of games/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /about us/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/With over a decade of experience/i),
    ).toBeInTheDocument();

    expect(
      screen.getByAltText(/banner with video game characters/i),
    ).toBeInTheDocument();

    const gameCards = await screen.findAllByTestId("game-card");
    expect(gameCards).toHaveLength(2);
    expect(screen.getByText("Game One")).toBeInTheDocument();
    expect(screen.getByText("Game Two")).toBeInTheDocument();
  });

  it("should render a message when no games are found", async () => {
    mockGetGames.mockResolvedValue({ games: [] });

    const Page = await Home();
    render(Page);

    const gameCards = screen.queryAllByTestId("game-card");
    expect(gameCards).toHaveLength(0);
  });
});
