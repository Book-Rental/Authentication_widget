import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import {
    loginUser,
    registerUser,
    sendOtp,
    verifyOtp,
} from "../services/authService";

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
                payload,
                {
                    withCredentials: true,
                }
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

    describe("sendOtp", () => {
        it("sends OTP successfully", async () => {
            const mockResponse = {
                message: "OTP sent successfully",
            };

            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue({
                    ok: true,
                    json: vi.fn().mockResolvedValue(mockResponse),
                })
            );

            const payload = {
                email: "sowmya@test.com",
                name: "Sowmya Chilpa",
            };

            const result = await sendOtp(payload);

            expect(result).toEqual(mockResponse);

            expect(fetch).toHaveBeenCalledWith(
                "https://be-book-rental.onrender.com/api/auth/send-otp",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                })
            );
        });

        it("throws error when send-otp fails", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue({
                    ok: false,
                    json: vi.fn().mockResolvedValue({
                        message: "Email is already registered",
                    }),
                })
            );

            await expect(
                sendOtp({
                    email: "sowmya@test.com",
                    name: "Sowmya Chilpa",
                })
            ).rejects.toThrow("Email is already registered");
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
                sendOtp({
                    email: "sowmya@test.com",
                    name: "Sowmya Chilpa",
                })
            ).rejects.toThrow("Failed to send OTP");
        });
    });

    describe("verifyOtp", () => {
        it("verifies OTP successfully", async () => {
            const mockResponse = {
                message: "Email verified successfully",
            };

            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue({
                    ok: true,
                    json: vi.fn().mockResolvedValue(mockResponse),
                })
            );

            const payload = {
                email: "sowmya@test.com",
                otp: "123456",
            };

            const result = await verifyOtp(payload);

            expect(result).toEqual(mockResponse);

            expect(fetch).toHaveBeenCalledWith(
                "https://be-book-rental.onrender.com/api/auth/verify-otp",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                })
            );
        });

        it("throws error when OTP is invalid", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue({
                    ok: false,
                    json: vi.fn().mockResolvedValue({
                        message: "Invalid or expired OTP",
                    }),
                })
            );

            await expect(
                verifyOtp({
                    email: "sowmya@test.com",
                    otp: "000000",
                })
            ).rejects.toThrow("Invalid or expired OTP");
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
                verifyOtp({
                    email: "sowmya@test.com",
                    otp: "000000",
                })
            ).rejects.toThrow("Invalid OTP");
        });
    });
});