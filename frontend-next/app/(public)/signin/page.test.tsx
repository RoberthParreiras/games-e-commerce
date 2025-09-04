import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockedSignIn = signIn as jest.Mock;
  const mockedUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    mockedSignIn.mockClear();
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it("should render the login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("should handle successful login", async () => {
    mockedSignIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should display an error message on failed login", async () => {
    mockedSignIn.mockResolvedValue({
      ok: false,
      error: "CredentialsSignin",
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "wrong@example.com",
        password: "wrongpassword",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
