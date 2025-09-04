import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import z from "zod";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Controller } from "react-hook-form";

import EditProduct from "./page";
import { apiFetch } from "@/app/api/fetch";

// Mock external modules and components
jest.mock("next-auth/react");
jest.mock("next/navigation");
jest.mock("@/app/api/fetch");

jest.mock("@/app/schemas/gameFormSchema", () => ({
  __esModule: true,
  formSchemaEdit: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Price is required"),
    image: z.any(),
  }),
}));

jest.mock("@/app/components/imageModal", () => ({
  __esModule: true, // This is important for modules with default exports
  default: () => <div data-testid="crop-image-modal-edit" />,
}));

jest.mock("@/app/components/ui/input", () => {
  const Input = (props: any) => {
    return <input {...props} />;
  };
  return { Input };
});

jest.mock("@/app/components/ui/form", () => ({
  ...jest.requireActual("@/app/components/ui/form"), // Keep original FormProvider etc.

  FormField: ({
    render,
    control,
    name,
  }: {
    render: (arg: { field: any }) => React.ReactNode;
    control: any;
    name: string;
  }) => render({ field: { name, control } }),
}));

jest.mock("@/app/components/ui/form", () => {
  const actual = jest.requireActual("@/app/components/ui/form");

  return {
    ...actual,
    FormField: ({
      control,
      name,
      render,
    }: {
      control: any;
      name: string;
      render: any;
    }) => (
      <Controller
        name={name}
        control={control}
        render={({ field }: any) => render({ field })}
      />
    ),
  };
});

jest.mock("@/app/components/base/alert", () => ({
  __esModule: true,
  CustomAlertDialog: ({
    children,
    onConfirm,
  }: {
    children: React.ReactNode;
    onConfirm: () => void;
  }) => (
    <div onClick={onConfirm} data-testid="alert-dialog">
      {children}
    </div>
  ),
}));
jest.mock("@/app/components/base/button", () => ({
  __esModule: true,
  CustomButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => <button {...props}>{children}</button>,
}));

const mockedUseSession = useSession as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedUseParams = useParams as jest.Mock;
const mockedApiFetch = apiFetch as jest.Mock;

describe("EditProduct Page", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockGameId = "123";
  const mockGameData = {
    game: {
      id: mockGameId,
      name: "Test Game",
      description: "A fun game",
      price: 5000, // in cents
      image: "http://example.com/old-image.jpg",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockPush, refresh: mockRefresh });
    mockedUseParams.mockReturnValue({ id: mockGameId });
    mockedUseSession.mockReturnValue({
      data: { accessToken: "fake-token" },
      status: "authenticated",
    });
    mockedApiFetch.mockResolvedValue(mockGameData);
  });

  it("should redirect unauthenticated users to signin", async () => {
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
    await act(async () => {
      render(<EditProduct />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signin");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("fetches product data and populates the form on mount", async () => {
    render(<EditProduct />);
    expect(
      await screen.findByDisplayValue(mockGameData.game.name)
    ).toBeInTheDocument();
  });

  it("handles form submission to update a game", async () => {
    await act(async () => {
      render(<EditProduct />);
    });
    screen.findByDisplayValue(mockGameData.game.name);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Updated Game Name" },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "Updated Description" },
      });
      fireEvent.change(screen.getByPlaceholderText(/R\$ 0,00/i), {
        target: { value: "99" },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockedApiFetch).toHaveBeenCalledWith(
        `/games/${mockGameId}`,
        expect.objectContaining({
          method: "PATCH",
          accessToken: "fake-token",
        })
      );
      const lastCall = mockedApiFetch.mock.calls.pop();
      const formData = lastCall?.[1]?.body as FormData;
      expect(formData.get("name")).toBe("Updated Game Name");
      expect(formData.get("image")).toBe(mockGameData.game.image); // Image not changed
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("handles game deletion", async () => {
    await act(async () => {
      render(<EditProduct />);
    });

    await screen.findByDisplayValue(mockGameData.game.name);

    fireEvent.click(screen.getByTestId("alert-dialog"));

    await waitFor(() => {
      expect(mockedApiFetch).toHaveBeenCalledWith(
        `/games/${mockGameId}`,
        expect.objectContaining({
          method: "DELETE",
          accessToken: "fake-token",
        })
      );
      const lastCall = mockedApiFetch.mock.calls.pop();
      const formData = lastCall?.[1]?.body as FormData;
      expect(formData.get("image")).toBe(mockGameData.game.image);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("navigates to admin page on cancel", async () => {
    await act(async () => {
      render(<EditProduct />);
    });

    await screen.findByDisplayValue(mockGameData.game.name);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith("/admin");
  });
});
