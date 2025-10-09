import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import z from "zod";
import { ComponentProps, ReactElement } from "react";

import CreateProduct from "./page";
import { apiFetch } from "@/app/api/fetch";
import { Controller, useFormContext } from "react-hook-form";

// Mock external modules and components
jest.mock("next-auth/react");
jest.mock("next/navigation");
jest.mock("@/app/api/fetch");

// Mock the schema to be used in the test environment
jest.mock("@/app/schemas/gameFormSchema", () => ({
  __esModule: true,
  formSchema: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Price is required"),
    images: z.any().refine((files) => files && files.length > 0, {
      message: "At least one image is required.",
    }),
  }),
}));

// Mock child components
jest.mock("@/app/components/imageModal", () => ({
  __esModule: true,
  default: function MockImageModal() {
    const { setValue } = useFormContext();

    return (
      <input
        type="file"
        data-testid="image-input"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setValue("images", [e.target.files[0]], { shouldValidate: true });
          }
        }}
      />
    );
  },
}));

// Mock the actual form fields component to ensure it's rendered
jest.mock("@/app/components/productForm", () => ({
  __esModule: true,
  GameForm: jest.requireActual("@/app/components/productForm").GameForm,
}));

// Mock UI primitives to allow interaction
jest.mock("@/app/components/ui/input", () => {
  const Input = (props: ComponentProps<"input">) => <input {...props} />;
  return { Input };
});

jest.mock("@/app/components/ui/form", () => {
  const actual = jest.requireActual("@/app/components/ui/form");

  return {
    ...actual,
    FormField: ({
      control,
      name,
      render,
    }: {
      control: unknown;
      name: string;
      render: (props: { field: unknown }) => ReactElement;
    }) => (
      <Controller
        name={name}
        control={control as never}
        render={({ field }) => render({ field })}
      />
    ),
  };
});

jest.mock("@/app/components/base/button", () => ({
  __esModule: true,
  CustomButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

const mockedUseSession = useSession as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedApiFetch = apiFetch as jest.Mock;

describe("CreateProduct Page", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockPush });
    mockedUseSession.mockReturnValue({
      data: { accessToken: "fake-token" },
      status: "authenticated",
    });
    mockedApiFetch.mockResolvedValue({ success: true });
  });

  it("should redirect unauthenticated users to signin", async () => {
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
    await act(async () => {
      render(<CreateProduct />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signin");
    });
  });

  it("handles form submission to create a new game", async () => {
    await act(async () => {
      render(<CreateProduct />);
    });

    const mockFile = new File(["dummy content"], "image.jpg", {
      type: "image/jpeg",
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "New Game" },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "A great new game" },
      });
      fireEvent.change(screen.getByPlaceholderText(/R\$ 0,00/i), {
        target: { value: "123" },
      });
      const imageInputs = screen.getAllByTestId("image-input");
      fireEvent.change(imageInputs[0], {
        target: { files: [mockFile] },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
    });

    await waitFor(() => {
      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/games",
        expect.objectContaining({
          method: "POST",
          accessToken: "fake-token",
        }),
      );
    });

    const lastCall = mockedApiFetch.mock.calls.pop();
    const formData = lastCall?.[1]?.body as FormData;
    expect(formData.get("name")).toBe("New Game");
    expect(formData.get("description")).toBe("A great new game");
    expect(formData.get("price")).toBe("123");

    const submittedFile = formData.get("file") as File;
    expect(submittedFile).toBeInstanceOf(File);
    expect(submittedFile.name).toBe(mockFile.name);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("shows validation error if image is missing on submit", async () => {
    await act(async () => {
      render(<CreateProduct />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
    });

    expect(
      await screen.findByText("At least one image is required."),
    ).toBeInTheDocument();
    expect(mockedApiFetch).not.toHaveBeenCalled();
  });

  it("navigates to admin page on cancel", async () => {
    await act(async () => {
      render(<CreateProduct />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    });

    expect(mockPush).toHaveBeenCalledWith("/admin");
  });
});
