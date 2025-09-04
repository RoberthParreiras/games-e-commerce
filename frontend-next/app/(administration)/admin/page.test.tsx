import { render, screen, waitFor } from "@testing-library/react";

import Dashboard from "./page";
import { getGames } from "@/app/lib/game-data";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/app/components/base/button", () => ({
  CustomButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
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
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("@/app/lib/game-data", () => ({
  getGames: jest.fn(),
}));

const mockedGetGames = getGames as jest.Mock;
const mockedUseSearchParams =
  jest.requireMock("next/navigation").useSearchParams;

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render and fetch games with default parameters", async () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams());
    const mockGameData = {
      games: [
        { id: "1", name: "Game One" },
        { id: "2", name: "Game Two" },
      ],
      totalPages: 10,
    };
    mockedGetGames.mockResolvedValue(mockGameData);

    render(<Dashboard />);

    expect(
      await screen.findByRole("button", { name: /add game/i }),
    ).toBeInTheDocument();

    expect(mockedGetGames).toHaveBeenCalledWith({
      page: 1,
      limitPerPage: 10,
      minPrice: undefined,
      maxPrice: undefined,
    });

    expect(screen.getByTestId("game-filter")).toBeInTheDocument();
    expect(screen.getAllByTestId("game-card-admin")).toHaveLength(2);
    expect(screen.getByText("Game One")).toBeInTheDocument();
    expect(screen.getByTestId("game-pagination")).toHaveTextContent(
      "Total Pages: 10",
    );
  });

  it("should fetch games using provided search parameters", async () => {
    const searchParams = new URLSearchParams({
      page: "3",
      limitPerPage: "5",
      minPrice: "20",
      maxPrice: "60",
    });
    mockedUseSearchParams.mockReturnValue(searchParams);

    const mockGameData = {
      games: [{ id: "3", name: "Filtered Game" }],
      totalPages: 1,
    };
    mockedGetGames.mockResolvedValue(mockGameData);

    render(<Dashboard />);

    expect(await screen.findByText("Filtered Game")).toBeInTheDocument();

    expect(mockedGetGames).toHaveBeenCalledWith({
      page: 3,
      limitPerPage: 5,
      minPrice: 2000,
      maxPrice: 6000,
    });

    expect(screen.getAllByTestId("game-card-admin")).toHaveLength(1);
    expect(screen.getByTestId("game-pagination")).toHaveTextContent(
      "Total Pages: 1",
    );
  });

  it("should correctly handle an empty list of games", async () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams());
    const mockGameData = {
      games: [],
      totalPages: 0,
    };
    mockedGetGames.mockResolvedValue(mockGameData);

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockedGetGames).toHaveBeenCalled();
    });

    expect(await screen.findByTestId("game-pagination")).toHaveTextContent(
      "Total Pages: 0",
    );

    expect(screen.queryByTestId("game-card-admin")).not.toBeInTheDocument();
  });
});
