import { render, screen, waitFor } from "@testing-library/react";

import Dashboard from "./page";
import { getGames } from "@/app/lib/game-data";

// Mock child components and modules
jest.mock("@/app/components/base/button", () => ({
  CustomButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => <button {...props}>{children}</button>,
}));

jest.mock("@/app/components/gameCardAdmin", () => ({
  GameCardAdmin: ({ game }: { game: { id: string; name: string } }) => (
    <div data-testid="game-card-admin">{game.name}</div>
  ),
}));

jest.mock("@/app/components/gameFilter", () => ({
  GameFilter: () => <div data-testid="game-filter" />,
}));

jest.mock("@/app/components/gamePagination", () => ({
  GamePagination: ({ totalPages }: { totalPages: number }) => (
    <div data-testid="game-pagination">Total Pages: {totalPages}</div>
  ),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock the data fetching function
jest.mock("@/app/lib/game-data", () => ({
  getGames: jest.fn(),
}));

const mockedGetGames = getGames as jest.Mock;

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render and fetch games with default parameters", async () => {
    const mockGameData = {
      games: [
        { id: "1", name: "Game One" },
        { id: "2", name: "Game Two" },
      ],
      totalPages: 10,
    };
    mockedGetGames.mockResolvedValue(mockGameData);

    // Since Dashboard is an async Server Component, we await its result
    const Page = await Dashboard({ searchParams: {} });
    render(Page);

    await waitFor(() => {
      expect(mockedGetGames).toHaveBeenCalledWith({
        page: 1,
        limitPerPage: 10,
        minPrice: undefined,
        maxPrice: undefined,
      });
    });

    expect(
      screen.getByRole("button", { name: /add game/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("game-filter")).toBeInTheDocument();

    expect(screen.getAllByTestId("game-card-admin")).toHaveLength(2);
    expect(screen.getByText("Game One")).toBeInTheDocument();

    expect(screen.getByTestId("game-pagination")).toHaveTextContent(
      "Total Pages: 10"
    );
  });

  it("should fetch games using provided search parameters", async () => {
    const mockGameData = {
      games: [{ id: "3", name: "Filtered Game" }],
      totalPages: 1,
    };
    mockedGetGames.mockResolvedValue(mockGameData);

    const searchParams = {
      page: "3",
      limitPerPage: "5",
      minPrice: "20",
      maxPrice: "60",
    };

    const Page = await Dashboard({ searchParams });
    render(Page);

    await waitFor(() => {
      expect(mockedGetGames).toHaveBeenCalledWith({
        page: 3,
        limitPerPage: 5,
        minPrice: 2000,
        maxPrice: 6000,
      });
    });

    expect(screen.getAllByTestId("game-card-admin")).toHaveLength(1);
    expect(screen.getByText("Filtered Game")).toBeInTheDocument();
    expect(screen.getByTestId("game-pagination")).toHaveTextContent(
      "Total Pages: 1"
    );
  });

  it("should correctly handle an empty list of games", async () => {
    const mockGameData = {
      games: [],
      totalPages: 0,
    };
    mockedGetGames.mockResolvedValue(mockGameData);

    const Page = await Dashboard({ searchParams: {} });
    render(Page);

    await waitFor(() => {
      expect(mockedGetGames).toHaveBeenCalled();
    });

    expect(screen.queryByTestId("game-card-admin")).not.toBeInTheDocument();

    expect(screen.getByTestId("game-pagination")).toHaveTextContent(
      "Total Pages: 0"
    );
  });
});
