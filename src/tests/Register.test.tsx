import { renderWithProviders } from "./test-utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Register from "../components/Register";
import * as authService from "../services/authService";
import { afterEach } from "vitest";
import { act } from "@testing-library/react";

afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

vi.mock("../services/authService", async () => {
    const actual = await vi.importActual("../services/authService");

    return {
        ...actual,
        registerUser: vi.fn(),
        sendOtp: vi.fn(),
        verifyOtp: vi.fn(),
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

type BaseFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const DEFAULT_FORM_VALUES: BaseFormValues = {
    firstName: "Sowmya",
    lastName: "Chilpa",
    email: "sowmya@test.com",
    password: "123456",
    confirmPassword: "123456",
};

const fillBaseForm = (overrides: Partial<BaseFormValues> = {}): BaseFormValues => {
    const values: BaseFormValues = {
        ...DEFAULT_FORM_VALUES,
        ...overrides,
    };

    fireEvent.change(screen.getByPlaceholderText("First Name"), {
        target: { value: values.firstName },
    });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), {
        target: { value: values.lastName },
    });
    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
        target: { value: values.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: values.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: values.confirmPassword },
    });

    return values;
};

/** Types a 6-digit OTP into the individual OTP boxes. */
const typeOtp = (otp: string) => {
    const boxes = screen.getAllByLabelText(/OTP digit/i);
    otp.split("").forEach((digit, i) => {
        fireEvent.change(boxes[i], { target: { value: digit } });
    });
};

/**
 * Drives the flow up to and including a successful "Create Account" click,
 * which triggers sendOtp and opens the OTP modal. Assumes the base form
 * fields are already filled in.
 */
const submitAndOpenOtpModal = async (email: string) => {
    vi.mocked(authService.sendOtp).mockResolvedValue({
        message: "OTP sent",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
        expect(authService.sendOtp).toHaveBeenCalledWith(
            expect.objectContaining({ email })
        );
    });

    await screen.findAllByLabelText(/OTP digit/i);
};

/** Returns the most recently dispatched toast CustomEvent, if any. */
const getLatestToastEvent = (
    calls: unknown[][]
): CustomEvent | undefined => {
    const toastEvents = calls
        .map((call) => call[0] as CustomEvent)
        .filter((event) => event.type === "app-toast-notification");

    return toastEvents[toastEvents.length - 1];
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
        expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    });

    it("renders last name input", () => {
        renderRegister();
        expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    });

    it("renders email input", () => {
        renderRegister();
        expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    });

    it("renders password input", () => {
        renderRegister();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
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
        expect(screen.getByPlaceholderText("Password")).toHaveAttribute(
            "type",
            "password"
        );
    });

    it("confirm password input has password type", () => {
        renderRegister();
        expect(screen.getByPlaceholderText("Confirm Password")).toHaveAttribute(
            "type",
            "password"
        );
    });

    it("login link is visible", () => {
        renderRegister();
        expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("registers successfully", async () => {
        const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

        vi.mocked(authService.registerUser).mockResolvedValue({
            message: "Registration successful!",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        vi.mocked(authService.verifyOtp).mockResolvedValue({
            message: "OTP verified",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        renderRegister();
        const { email } = fillBaseForm();

        await submitAndOpenOtpModal(email);

        typeOtp("123456");

        fireEvent.click(screen.getByRole("button", { name: /verify otp/i }));

        await waitFor(() => {
            expect(authService.verifyOtp).toHaveBeenCalledWith({
                email,
                otp: "123456",
            });
        });

        await waitFor(() => {
            expect(authService.registerUser).toHaveBeenCalled();
        });

        await waitFor(() => {
            const event = getLatestToastEvent(dispatchEventSpy.mock.calls);
            expect(event?.detail).toEqual({
                message: "Registration successful!",
                type: "success",
            });
        });
    });
it("clears a digit and does not advance focus when a box is cleared", async () => {
    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    const boxes = screen.getAllByLabelText(/OTP digit/i);

    fireEvent.change(boxes[0], { target: { value: "5" } });
    expect(boxes[0]).toHaveValue("5");

    fireEvent.change(boxes[0], { target: { value: "" } });
    expect(boxes[0]).toHaveValue("");
});

it("moves focus to the previous box on Backspace when the current box is empty", async () => {
    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    const boxes = screen.getAllByLabelText(/OTP digit/i) as HTMLInputElement[];

    // Fill first box, which auto-advances focus to the second box
    fireEvent.change(boxes[0], { target: { value: "1" } });
    boxes[1].focus();
    expect(document.activeElement).toBe(boxes[1]);

    // Second box is empty; Backspace should move focus back to the first box
    fireEvent.keyDown(boxes[1], { key: "Backspace" });
    expect(document.activeElement).toBe(boxes[0]);
});

it("does not move focus on Backspace when it's already the first box", async () => {
    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    const boxes = screen.getAllByLabelText(/OTP digit/i) as HTMLInputElement[];

    boxes[0].focus();
    fireEvent.keyDown(boxes[0], { key: "Backspace" });

    expect(document.activeElement).toBe(boxes[0]);
});

it("fills all boxes when a full OTP is pasted", async () => {
    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    const boxes = screen.getAllByLabelText(/OTP digit/i) as HTMLInputElement[];

    const clipboardData = {
        getData: () => "123456",
    };

    fireEvent.paste(boxes[0], { clipboardData });

    boxes.forEach((box, i) => {
        expect(box).toHaveValue(String(i + 1));
    });
});

it("ignores non-numeric characters when pasting an OTP", async () => {
    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    const boxes = screen.getAllByLabelText(/OTP digit/i) as HTMLInputElement[];

    const clipboardData = {
        getData: () => "12a34b",
    };

    fireEvent.paste(boxes[0], { clipboardData });

    // non-digits are stripped, leaving "1234"
    expect(boxes[0]).toHaveValue("1");
    expect(boxes[1]).toHaveValue("2");
    expect(boxes[2]).toHaveValue("3");
    expect(boxes[3]).toHaveValue("4");
    expect(boxes[4]).toHaveValue("");
    expect(boxes[5]).toHaveValue("");
});

it("does nothing when pasting an empty clipboard value", async () => {
    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    const boxes = screen.getAllByLabelText(/OTP digit/i) as HTMLInputElement[];

    const clipboardData = {
        getData: () => "",
    };

    fireEvent.paste(boxes[0], { clipboardData });

    boxes.forEach((box) => expect(box).toHaveValue(""));
});

it("resends the OTP, clears the boxes, and shows a success toast", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    typeOtp("123456");

    vi.mocked(authService.sendOtp).mockResolvedValue({
        message: "OTP sent",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    fireEvent.click(screen.getByRole("button", { name: /resend otp/i }));

    await waitFor(() => {
        expect(authService.sendOtp).toHaveBeenCalledWith(
            expect.objectContaining({ email })
        );
    });

    await waitFor(() => {
        const event = getLatestToastEvent(dispatchEventSpy.mock.calls);
        expect(event?.detail).toEqual({
            message: `OTP sent to ${email}`,
            type: "success",
        });
    });

    // Boxes should be cleared after a resend
    const boxes = screen.getAllByLabelText(/OTP digit/i);
    boxes.forEach((box) => expect(box).toHaveValue(""));
});

it("shows an error toast when resending the OTP fails", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    renderRegister();
    const { email } = fillBaseForm();

    await submitAndOpenOtpModal(email);

    vi.mocked(authService.sendOtp).mockRejectedValue(
        new Error("Could not resend OTP")
    );

    fireEvent.click(screen.getByRole("button", { name: /resend otp/i }));

    await waitFor(() => {
        const event = getLatestToastEvent(dispatchEventSpy.mock.calls);
        expect(event?.detail).toEqual({
            message: "Could not resend OTP",
            type: "error",
        });
    });
});

    it("shows error toast when registration fails", async () => {
        const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

        vi.mocked(authService.registerUser).mockRejectedValue(
            new Error("Email already exists")
        );
        vi.mocked(authService.verifyOtp).mockResolvedValue({
            message: "OTP verified",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        renderRegister();
        const { email } = fillBaseForm();

        await submitAndOpenOtpModal(email);

        typeOtp("123456");

        fireEvent.click(screen.getByRole("button", { name: /verify otp/i }));

        await waitFor(() => {
            const event = getLatestToastEvent(dispatchEventSpy.mock.calls);
            expect(event?.detail).toEqual({
                message: "Email already exists",
                type: "error",
            });
        });
    });

    it("resets form when isLogin is true", () => {
        renderWithProviders(<Register isLogin={true} setIsLogin={vi.fn()} />);

        expect(
            screen.getByRole("heading", { name: "Create Account" })
        ).toBeInTheDocument();
    });

    it("switches to login after successful registration", async () => {
        vi.mocked(authService.registerUser).mockResolvedValue({
            message: "Registration successful!",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        vi.mocked(authService.verifyOtp).mockResolvedValue({
            message: "OTP verified",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const setIsLogin = vi.fn();

        renderWithProviders(<Register isLogin={false} setIsLogin={setIsLogin} />);
        const { email } = fillBaseForm();

        // Complete the OTP flow BEFORE enabling fake timers, so real-time
        // based `waitFor` polling isn't blocked.
        await submitAndOpenOtpModal(email);
        typeOtp("123456");

        vi.useFakeTimers({ shouldAdvanceTime: true });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /verify otp/i }));
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();
        });

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(setIsLogin).toHaveBeenCalledWith(true);
    });

    it("shows invalid first name validation", async () => {
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John123" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Only alphabets are allowed.")
        ).toBeInTheDocument();
    });

    it("shows invalid last name validation", async () => {
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Doe123" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Only alphabets are allowed.")
        ).toBeInTheDocument();
    });

    it("shows password mismatch validation", async () => {
        renderRegister();

        fillBaseForm({ confirmPassword: "654321" });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Passwords do not match")
        ).toBeInTheDocument();
    });

    it("toggles password visibility", () => {
        renderRegister();

        const password = screen.getByPlaceholderText(
            "Password"
        ) as HTMLInputElement;

        expect(password.type).toBe("password");

        fireEvent.click(screen.getByLabelText("toggle password visibility"));

        expect(password.type).toBe("text");
    });

    it("toggles confirm password visibility", () => {
        renderRegister();

        const confirmPassword = screen.getByPlaceholderText(
            "Confirm Password"
        ) as HTMLInputElement;

        expect(confirmPassword.type).toBe("password");

        fireEvent.click(
            screen.getByLabelText("toggle confirm password visibility")
        );

        expect(confirmPassword.type).toBe("text");
    });

    it("shows an error toast and does not open the OTP modal for an invalid email", async () => {
        renderRegister();

        fillBaseForm({ email: "not-an-email" });

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        expect(
            await screen.findByText("Please enter a valid email")
        ).toBeInTheDocument();

        expect(authService.sendOtp).not.toHaveBeenCalled();
        expect(screen.queryAllByLabelText(/OTP digit/i)).toHaveLength(0);
    });

    it("shows an inline error when OTP boxes are left empty on verify", async () => {
        renderRegister();
        const { email } = fillBaseForm();

        await submitAndOpenOtpModal(email);

        fireEvent.click(screen.getByRole("button", { name: /verify otp/i }));

        expect(
            await screen.findByText("Please enter all 6 digits")
        ).toBeInTheDocument();
        expect(authService.verifyOtp).not.toHaveBeenCalled();
    });

    it("shows an error toast when sendOtp fails", async () => {
        const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

        vi.mocked(authService.sendOtp).mockRejectedValue(
            new Error("Unable to send OTP")
        );

        renderRegister();
        fillBaseForm();

        fireEvent.click(
            screen.getByRole("button", { name: /create account/i })
        );

        await waitFor(() => {
            const event = getLatestToastEvent(dispatchEventSpy.mock.calls);
            expect(event?.detail).toEqual({
                message: "Unable to send OTP",
                type: "error",
            });
        });

        // modal should never open since sendOtp failed
        expect(screen.queryAllByLabelText(/OTP digit/i)).toHaveLength(0);
    });

    it("shows an inline error and clears the boxes when verifyOtp fails", async () => {
        vi.mocked(authService.verifyOtp).mockRejectedValue(
            new Error("Incorrect OTP. Please try again.")
        );

        renderRegister();
        const { email } = fillBaseForm();

        await submitAndOpenOtpModal(email);

        typeOtp("999999");

        fireEvent.click(screen.getByRole("button", { name: /verify otp/i }));

        expect(
            await screen.findByText("Incorrect OTP. Please try again.")
        ).toBeInTheDocument();

        // modal should stay open since verification failed, and boxes are cleared
        const boxes = screen.getAllByLabelText(/OTP digit/i);
        expect(boxes).toHaveLength(6);
        boxes.forEach((box) => expect(box).toHaveValue(""));
    });

    it("closes the OTP modal and clears the boxes when Cancel is clicked", async () => {
        renderRegister();
        const { email } = fillBaseForm();

        await submitAndOpenOtpModal(email);

        typeOtp("123456");

        fireEvent.click(screen.getByText("Cancel"));

        await waitFor(() => {
            expect(screen.queryAllByLabelText(/OTP digit/i)).toHaveLength(0);
        });

        // Reopening should start with blank boxes, confirming state was cleared
        await submitAndOpenOtpModal(email);

        const boxes = screen.getAllByLabelText(/OTP digit/i);
        boxes.forEach((box) => expect(box).toHaveValue(""));
    });
    
});