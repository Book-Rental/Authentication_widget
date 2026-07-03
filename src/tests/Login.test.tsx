import { renderWithProviders } from "./test-utils";
import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Login from "../components/Login";
import toast from "react-hot-toast";
import * as authService from "../services/authService";

vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../services/authService", async () => {
    const actual = await vi.importActual("../services/authService");
    return {
        ...actual,
        loginUser: vi.fn(),
    };
});

const renderLogin = (setIsLogin = vi.fn()) => {
    return renderWithProviders(
        <Login
            isLogin={true}
            setIsLogin={setIsLogin}
            options={{
                containerElementId: "test-container",
                name: "Sowmya",
            }}
        />
    );
};

describe("Login Component", () => {
    it("renders login title", () => {
        renderLogin();

        expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    it("shows email required validation", async () => {
        renderLogin();

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        expect(
            await screen.findByText("Email is required")
        ).toBeInTheDocument();
    });

    it("shows password required validation", async () => {
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText("Email Address"), {
            target: { value: "test@test.com" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        expect(
            await screen.findByText("Password is required")
        ).toBeInTheDocument();
    });

    it("calls setIsLogin when Register is clicked", () => {
        const setIsLogin = vi.fn();

        renderLogin(setIsLogin);

        fireEvent.click(screen.getByText("Register"));

        expect(setIsLogin).toHaveBeenCalledWith(false);
    });

    it("renders email input", () => {
        renderLogin();

        expect(
            screen.getByPlaceholderText("Email Address")
        ).toBeInTheDocument();
    });

    it("renders password input", () => {
        renderLogin();

        expect(
            screen.getByPlaceholderText("Password")
        ).toBeInTheDocument();
    });

    it("renders login button", () => {
        renderLogin();

        expect(
            screen.getByRole("button", { name: "Login" })
        ).toBeInTheDocument();
    });

    it("allows typing into email field", () => {
        renderLogin();

        const email = screen.getByPlaceholderText(
            "Email Address"
        ) as HTMLInputElement;

        fireEvent.change(email, {
            target: { value: "john@test.com" },
        });

        expect(email.value).toBe("john@test.com");
    });

    it("allows typing into password field", () => {
        renderLogin();

        const password = screen.getByPlaceholderText(
            "Password"
        ) as HTMLInputElement;

        fireEvent.change(password, {
            target: { value: "123456" },
        });

        expect(password.value).toBe("123456");
    });

    it("email input has correct type", () => {
        renderLogin();

        expect(
            screen.getByPlaceholderText("Email Address")
        ).toHaveAttribute("type", "email");
    });

    it("password input has correct type", () => {
        renderLogin();

        expect(
            screen.getByPlaceholderText("Password")
        ).toHaveAttribute("type", "password");
    });

    it("register link is visible", () => {
        renderLogin();

        expect(screen.getByText("Register")).toBeInTheDocument();
    });

    it("login button is enabled initially", () => {
        renderLogin();

        expect(
            screen.getByRole("button", { name: "Login" })
        ).toBeEnabled();
    });
    it("logs in successfully", async () => {
        vi.mocked(authService.loginUser).mockResolvedValue({
            data: {
                token: "dummy-token",
                userInfo: {
                    id: 1,
                    name: "Sowmya",
                },
            },
            message: "Login successful!",
             // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any);

        const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText("Email Address"), {
            target: { value: "test@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await screen.findByRole("button", { name: /login/i });

        expect(authService.loginUser).toHaveBeenCalled();

        expect(setItemSpy).toHaveBeenCalled();

        expect(toast.success).toHaveBeenCalled();
    });
});