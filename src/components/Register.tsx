import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { registerUser, sendOtp, verifyOtp } from "../services/authService";
import { RegisterFormData, RegisterPayload } from "../types/auth";
import { VALIDATION_MESSAGES, PLACEHOLDERS, REGISTER_TEXT } from "../constants";
import { showToast } from "../utils/showToast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Rb_Text, Rb_Label, Rb_Input, Rb_Icon, Rb_Button } from "@rentbook/rentbook-ui-lib";

const OTP_LENGTH = 6;

interface RegisterProps {
    isLogin: boolean;
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Register = ({ isLogin, setIsLogin }: RegisterProps) => {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<RegisterFormData>();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [otpError, setOtpError] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<RegisterPayload | null>(null);

    const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const resetOtpBoxes = () => {
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError("");
    };

    useEffect(() => {
        if (isLogin) {
            reset();
            setShowOtpModal(false);
            resetOtpBoxes();
            setIsSendingOtp(false);
            setIsVerifyingOtp(false);
            setPendingPayload(null);
        }
    }, [isLogin, reset]);

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (response) => {
            showToast(response.message, "success");
            reset();
            setShowOtpModal(false);
            resetOtpBoxes();
            setPendingPayload(null);
            setTimeout(() => {
                setIsLogin(true);
            }, 1000);
        },
        onError: (error: Error) => {
            showToast(error.message || REGISTER_TEXT.GENERIC_ERROR, "error");
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        const payload: RegisterPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
        };

        try {
            setIsSendingOtp(true);
            const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
            await sendOtp({ email: data.email, name });

            setPendingPayload(payload);
            resetOtpBoxes();
            showToast(`${REGISTER_TEXT.OTP_SENT_SUCCESS} ${data.email}`, "success");
            setShowOtpModal(true);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            showToast(error.message || REGISTER_TEXT.OTP_SEND_FAILED, "error");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpChange = (index: number, rawValue: string) => {
        const value = rawValue.replace(/\D/g, "");
        if (!value) {
            const next = [...otpDigits];
            next[index] = "";
            setOtpDigits(next);
            return;
        }

        const next = [...otpDigits];
        next[index] = value[value.length - 1];
        setOtpDigits(next);
        setOtpError("");

        if (index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        e.preventDefault();

        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((digit, i) => {
            next[i] = digit;
        });
        setOtpDigits(next);
        setOtpError("");

        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        otpInputRefs.current[focusIndex]?.focus();
    };

    const handleVerifyOtp = async () => {
        const otp = otpDigits.join("");

        if (otp.length < OTP_LENGTH) {
            setOtpError(REGISTER_TEXT.OTP_EMPTY);
            return;
        }
            /* v8 ignore next 4 -- defensive guard: pendingPayload is always set
       before the OTP modal (and therefore this button) can render */
        if (!pendingPayload) {
            showToast(REGISTER_TEXT.GENERIC_ERROR, "error");
            return;
        }

        try {
            setIsVerifyingOtp(true);
            setOtpError("");
            await verifyOtp({ email: pendingPayload.email, otp });
            showToast(REGISTER_TEXT.OTP_VERIFY_SUCCESS, "success");
            registerMutation.mutate(pendingPayload);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            const message = error.message || REGISTER_TEXT.OTP_VERIFY_FAILED;
            setOtpError(message);
            setOtpDigits(Array(OTP_LENGTH).fill(""));
            otpInputRefs.current[0]?.focus();
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (!pendingPayload) return;
        try {
            setIsSendingOtp(true);
            const name = `${pendingPayload.firstName || ""} ${pendingPayload.lastName || ""}`.trim();
            await sendOtp({ email: pendingPayload.email, name });
            resetOtpBoxes();
            otpInputRefs.current[0]?.focus();
            showToast(`${REGISTER_TEXT.OTP_SENT_SUCCESS} ${pendingPayload.email}`, "success");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            showToast(error.message || REGISTER_TEXT.OTP_SEND_FAILED, "error");
        } finally {
            setIsSendingOtp(false);
        }
    };

    return (
        <div className="px-6 py-1 flex flex-col justify-center">
            <div className="mb-1.5 text-center">
                <Rb_Text variant="h2">
                    {REGISTER_TEXT.TITLE}
                </Rb_Text>
            </div>

       
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Rb_Label htmlFor="firstName" required className="text-sm">
                            First Name
                        </Rb_Label>
                        <Rb_Input
                            id="firstName"
                            type="text"
                            placeholder={PLACEHOLDERS.FIRST_NAME}
                            error={!!errors.firstName}
                            {...register("firstName", {
                                required: VALIDATION_MESSAGES.FIRST_NAME_REQUIRED,
                                pattern: {
                                    value: /^[A-Za-z]+$/,
                                    message: VALIDATION_MESSAGES.FIRST_NAME_INVALID,
                                },
                            })}
                            className="rounded-lg !mt-1 !mb-0"
                            borderClass='border !border-gray-500'
                        />
                        <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                            {errors.firstName?.message || ""}
                        </Rb_Text>
                    </div>

                    <div>
                        <Rb_Label htmlFor="lastName" required className="text-sm">
                            Last Name
                        </Rb_Label>
                        <Rb_Input
                            id="lastName"
                            type="text"
                            placeholder={PLACEHOLDERS.LAST_NAME}
                            error={!!errors.lastName}
                            {...register("lastName", {
                                required: VALIDATION_MESSAGES.LAST_NAME_REQUIRED,
                                pattern: {
                                    value: /^[A-Za-z]+$/,
                                    message: VALIDATION_MESSAGES.LAST_NAME_INVALID,
                                },
                            })}
                            className="rounded-lg !mt-1 !mb-0"
                            borderClass='border !border-gray-500'
                        />
                        <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                            {errors.lastName?.message || ""}
                        </Rb_Text>
                    </div>
                </div>

                <div>
                    <Rb_Label htmlFor="email" required className="text-sm">
                        Email
                    </Rb_Label>
                    <Rb_Input
                        id="email"
                        type="email"
                        placeholder={PLACEHOLDERS.EMAIL}
                        error={!!errors.email}
                        {...register("email", {
                            required: VALIDATION_MESSAGES.EMAIL_REQUIRED,
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: VALIDATION_MESSAGES.EMAIL_INVALID,
                            },
                        })}
                        className="rounded-lg !mt-1 !mb-0"
                        borderClass='border !border-gray-500'
                    />
                    <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                        {errors.email?.message || ""}
                    </Rb_Text>
                </div>

                <div className="relative">
                    <Rb_Label htmlFor="password" required className="text-sm">
                        Password
                    </Rb_Label>
                    <Rb_Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={PLACEHOLDERS.PASSWORD}
                        error={!!errors.password}
                        {...register("password", {
                            required: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
                            minLength: {
                                value: 6,
                                message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
                            },
                        })}
                        className="rounded-lg !mt-1 !mb-0"
                        borderClass='border !border-gray-500'
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="toggle password visibility"
                        className="absolute right-3 top-[55%] -translate-y-1/2 text-gray-500"
                    >
                        <Rb_Icon
                            icon={showPassword ? FaEyeSlash : FaEye}
                            size={15} color="#3b82f6"
                        />
                    </button>
                    <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                        {errors.password?.message || ""}
                    </Rb_Text>
                </div>

                <div className="relative">
                    <Rb_Label htmlFor="confirmPassword" required className="text-sm">
                        Confirm Password
                    </Rb_Label>
                    <Rb_Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={PLACEHOLDERS.CONFIRM_PASSWORD}
                        error={!!errors.confirmPassword}
                        {...register("confirmPassword", {
                            required: VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
                            validate: (value) =>
                                value === watch("password") ||
                                VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH,
                        })}
                        className="rounded-lg !mt-1 !mb-0"
                        borderClass='border !border-gray-500'
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="toggle confirm password visibility"
                        className="absolute right-3 top-[55%] -translate-y-1/2 text-gray-500"
                    >
                        <Rb_Icon
                            icon={showConfirmPassword ? FaEyeSlash : FaEye}
                            size={15} color="#3b82f6"
                        />
                    </button>
                    <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                        {errors.confirmPassword?.message || ""}
                    </Rb_Text>
                </div>

                <Rb_Button
                    type="submit"
                    className="w-full mt-1"
                    isLoading={isSendingOtp}
                >
                    {isSendingOtp ? REGISTER_TEXT.SENDING_OTP : REGISTER_TEXT.SUBMIT_BUTTON}
                </Rb_Button>
            </form>

            <div className="text-center text-sm mt-2">
                <Rb_Text variant="span">
                    {REGISTER_TEXT.LOGIN_PROMPT}{" "}
                </Rb_Text>
                <Rb_Text
                    variant="span"
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 cursor-pointer font-semibold"
                >
                    {REGISTER_TEXT.LOGIN_LINK}
                </Rb_Text>
            </div>

            {showOtpModal && createPortal(
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <Rb_Text variant="h3" className="text-blue-700 font-semibold">
                            {REGISTER_TEXT.OTP_MODAL_TITLE}
                        </Rb_Text>
                        <Rb_Text variant="p" className="text-gray-500 text-sm mt-1 mb-4">
                            {REGISTER_TEXT.OTP_SENT_PREFIX}{" "}
                            <span className="font-medium text-gray-700">{pendingPayload?.email}</span>.
                        </Rb_Text>

                        <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { otpInputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    aria-label={`OTP digit ${index + 1}`}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className={`w-11 h-12 text-center text-lg font-semibold rounded-lg border outline-none transition-colors
                                        ${otpError
                                            ? "border-red-500 focus:border-red-500 text-red-600"
                                            : "border-gray-300 focus:border-blue-600"}`}
                                />
                            ))}
                        </div>

                        <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-2">
                            {otpError}
                        </Rb_Text>

                        <Rb_Button
                            type="button"
                            onClick={handleVerifyOtp}
                            isLoading={isVerifyingOtp || registerMutation.isPending}
                            className="w-full mt-2 !bg-blue-600 hover:!bg-blue-700 !text-white"
                        >
                            {REGISTER_TEXT.VERIFY_OTP_BUTTON}
                        </Rb_Button>

                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isSendingOtp}
                            className="text-blue-600 text-sm mt-3 underline block text-center w-full hover:text-blue-700 disabled:opacity-50"
                        >
                            {isSendingOtp ? REGISTER_TEXT.SENDING_OTP : REGISTER_TEXT.RESEND_OTP}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowOtpModal(false);
                                resetOtpBoxes();
                            }}
                            className="text-gray-500 text-sm mt-2 underline block text-center w-full hover:text-gray-700"
                        >
                            {REGISTER_TEXT.CANCEL_BUTTON}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Register;