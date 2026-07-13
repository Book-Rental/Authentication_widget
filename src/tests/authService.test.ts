import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { loginUser, registerUser } from "../services/authService";

vi.mock("axios");

describe("authService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("registerUser", () => {
        it("registers user successfully", async () => {
            const mockResponse = {
                message: "Registration successful!",
            };

            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue({
                    ok: true,
                    json: vi.fn().mockResolvedValue(mockResponse),
                })
            );

            const result = await registerUser({
                firstName: "Sowmya",
                lastName: "Chilpa",
                email: "sowmya@test.com",
                password: "123456",
            });

            expect(result).toEqual(mockResponse);

            expect(fetch).toHaveBeenCalledWith(
                "https://be-book-rental.onrender.com/api/user/create",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
            );
        });

        it("throws error when registration fails", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue({
                    ok: false,
                    json: vi.fn().mockResolvedValue({
                        message: "Email already exists",
                    }),
                })
            );

            await expect(
                registerUser({
                    firstName: "Sowmya",
                    lastName: "Chilpa",
                    email: "sowmya@test.com",
                    password: "123456",
                })
            ).rejects.toThrow("Email already exists");
        });

        it("throws default error when message is missing", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue({
                    ok: false,
                    json: vi.fn().mockResolvedValue({}),
                })
            );

            await expect(
                registerUser({
                    firstName: "Sowmya",
                    lastName: "Chilpa",
                    email: "sowmya@test.com",
                    password: "123456",
                })
            ).rejects.toThrow("Registration failed");
        });
    });

    describe("loginUser", () => {
        it("logs in successfully", async () => {
            const mockResponse = {
                data: {
                    token: "dummy-token",
                    userInfo: {
                        id: 1,
                        name: "Sowmya",
                    },
                },
            };

            vi.mocked(axios.post).mockResolvedValue(mockResponse);

            const payload = {
                email: "sowmya@test.com",
                password: "123456",
            };

            const result = await loginUser(payload);

            expect(result).toEqual(mockResponse.data);

            expect(axios.post).toHaveBeenCalledWith(
                "https://be-book-rental.onrender.com/api/auth/login",
                payload
            );
        });

        it("throws when login api fails", async () => {
            vi.mocked(axios.post).mockRejectedValue(
                new Error("Login failed")
            );

            await expect(
                loginUser({
                    email: "test@test.com",
                    password: "123456",
                })
            ).rejects.toThrow("Login failed");
        });
    });
});