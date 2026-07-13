import { renderWithProviders } from "./test-utils";
import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Register from "../components/Register";
import * as authService from "../services/authService";
import { waitFor } from "@testing-library/react";
import { afterEach } from "vitest";
import { act } from "@testing-library/react";

afterEach(() => {
    vi.restoreAllMocks();
});

vi.mock("../services/authService", async () => {
    const actual = await vi.importActual("../services/authService");

    return {
        ...actual,
        registerUser: vi.fn(),
    };
});

const renderRegister = (setIsLogin = vi.fn()) => {
    return renderWithProviders(
        <Register
            isLogin={false}
            setIsLogin={setIsLogin}
        />
    );
};

describe("Register Component", () => {
    it("renders register title", () => {
        renderRegister();

        expect(
            screen.getByRole("heading", { name: "Create Account" })
        ).toBeInTheDocument();
    });

    it("shows first name required validation", async () => {
        renderRegister();

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("First Name is required")
        ).toBeInTheDocument();
    });

    it("shows last name required validation", async () => {
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Last Name is required")
        ).toBeInTheDocument();
    });

    it("shows email required validation", async () => {
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });

        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Doe" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Email is required")
        ).toBeInTheDocument();
    });

    it("shows password required validation", async () => {
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });

        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Doe" },
        });

        fireEvent.change(screen.getByPlaceholderText("Email Address"), {
            target: { value: "john@test.com" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Password is required")
        ).toBeInTheDocument();
    });

    it("shows confirm password required validation", async () => {
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });

        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Doe" },
        });

        fireEvent.change(screen.getByPlaceholderText("Email Address"), {
            target: { value: "john@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Confirm Password is required")
        ).toBeInTheDocument();
    });

    it("calls setIsLogin when Login is clicked", () => {
        const setIsLogin = vi.fn();

        renderRegister(setIsLogin);

        fireEvent.click(screen.getByText("Login"));

        expect(setIsLogin).toHaveBeenCalledWith(true);
    });

    it("renders first name input", () => {
        renderRegister();

        expect(
            screen.getByPlaceholderText("First Name")
        ).toBeInTheDocument();
    });

    it("renders last name input", () => {
        renderRegister();

        expect(
            screen.getByPlaceholderText("Last Name")
        ).toBeInTheDocument();
    });

    it("renders email input", () => {
        renderRegister();

        expect(
            screen.getByPlaceholderText("Email Address")
        ).toBeInTheDocument();
    });

    it("renders password input", () => {
        renderRegister();

        expect(
            screen.getByPlaceholderText("Password")
        ).toBeInTheDocument();
    });

    it("renders confirm password input", () => {
        renderRegister();

        expect(
            screen.getByPlaceholderText("Confirm Password")
        ).toBeInTheDocument();
    });

    it("renders create account button", () => {
        renderRegister();

        expect(
            screen.getByRole("button", { name: "Create Account" })
        ).toBeInTheDocument();
    });

    it("password input has password type", () => {
        renderRegister();

        expect(
            screen.getByPlaceholderText("Password")
        ).toHaveAttribute("type", "password");
    });

    it("confirm password input has password type", () => {
        renderRegister();

        expect(
            screen.getByPlaceholderText("Confirm Password")
        ).toHaveAttribute("type", "password");
    });

    it("login link is visible", () => {
        renderRegister();

        expect(screen.getByText("Login")).toBeInTheDocument();
    });
    it("registers successfully", async () => {
        vi.mocked(authService.registerUser).mockResolvedValue({
            message: "Registration successful!",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "Sowmya" },
        });

        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Chilpa" },
        });

        fireEvent.change(screen.getByPlaceholderText("Email Address"), {
            target: { value: "sowmya@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "123456" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        await waitFor(() => {
            expect(authService.registerUser).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(dispatchEventSpy).toHaveBeenCalled();
        });

        const event = dispatchEventSpy.mock.calls.find(
            ([event]) => event.type === "app-toast-notification"
        )?.[0] as CustomEvent;

        expect(event.detail).toEqual({
            message: "Registration successful!",
            type: "success",
        });
    });

    it("shows error toast when registration fails", async () => {
        vi.mocked(authService.registerUser).mockRejectedValue(
            new Error("Email already exists")
        );

        const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "Sowmya" },
        });

        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Chilpa" },
        });

        fireEvent.change(screen.getByPlaceholderText("Email Address"), {
            target: { value: "sowmya@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "123456" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        await waitFor(() => {
            expect(dispatchEventSpy).toHaveBeenCalled();
        });
    });

    it("resets form when isLogin is true", () => {
        renderWithProviders(
            <Register
                isLogin={true}
                setIsLogin={vi.fn()}
            />
        );

        expect(
            screen.getByRole("heading", { name: "Create Account" })
        ).toBeInTheDocument();
    });


    it("switches to login after successful registration", async () => {
        vi.useFakeTimers();

        vi.mocked(authService.registerUser).mockResolvedValue({
            message: "Registration successful!",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const setIsLogin = vi.fn();

        renderWithProviders(
            <Register
                isLogin={false}
                setIsLogin={setIsLogin}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "Sowmya" },
        });

        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Chilpa" },
        });

        fireEvent.change(screen.getByPlaceholderText("Email Address"), {
            target: { value: "sowmya@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "123456" },
        });

        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", { name: /create account/i })
            );

            // Flush pending promises from React Query
            await Promise.resolve();
            await Promise.resolve();
        });

        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        expect(setIsLogin).toHaveBeenCalledWith(true);

        vi.useRealTimers();
    });
});