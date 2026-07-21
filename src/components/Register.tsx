import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { registerUser, sendOtp, verifyOtp } from "../services/authService";
import { RegisterFormData, RegisterPayload } from "../types/auth";
import { VALIDATION_MESSAGES, PLACEHOLDERS, REGISTER_TEXT } from "../constants";
import { showToast } from "../utils/showToast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { Rb_Text, Rb_Label, Rb_Input, Rb_Icon, Rb_Button } from "@rentbook/rentbook-ui-lib";

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
    const [otp, setOtp] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    useEffect(() => {
        if (isLogin) {
            reset();
        }
    }, [isLogin, reset]);

    const registerMutation = useMutation({
        mutationFn: registerUser,

        onSuccess: (response) => {
            showToast(response.message, "success");
            reset();

            setTimeout(() => {
                setIsLogin(true);
            }, 1500);
        },
        onError: (error: Error) => {
            showToast(error.message || REGISTER_TEXT.GENERIC_ERROR, "error");
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        if (!isEmailVerified) {
            showToast(REGISTER_TEXT.EMAIL_NOT_VERIFIED, "error");
            return; // never calls the API
        }
        const payload: RegisterPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
        };

        registerMutation.mutate(payload);
    };

    const handleSendOtp = async () => {
        const email = watch("email");
        const firstName = watch("firstName");
        const lastName = watch("lastName");

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast(REGISTER_TEXT.OTP_INVALID_EMAIL, "error");
            return;
        }

        try {
            setIsSendingOtp(true);
            const name = `${firstName || ""} ${lastName || ""}`.trim();
            await sendOtp({ email, name });
            showToast(`${REGISTER_TEXT.OTP_SENT_SUCCESS} ${email}`, "success");
            setShowOtpModal(true);
        }
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        catch (error: any) {
            showToast(error.message || REGISTER_TEXT.OTP_SEND_FAILED, "error");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        const email = watch("email");

        if (!otp) {
            showToast(REGISTER_TEXT.OTP_EMPTY, "error");
            return;
        }

        try {
            setIsVerifyingOtp(true);
            await verifyOtp({ email, otp });
            setIsEmailVerified(true);
            showToast(REGISTER_TEXT.OTP_VERIFY_SUCCESS, "success");
            setShowOtpModal(false);
            setOtp("");
        }
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        catch (error: any) {
            showToast(error.message || REGISTER_TEXT.OTP_VERIFY_FAILED, "error");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    return (
        <div className="px-6 py-1 flex flex-col justify-center">
            <div className="mb-1.5 text-center">
                <Rb_Text variant="h2">
                    {REGISTER_TEXT.TITLE}
                </Rb_Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
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
                    <div className="flex items-center gap-2 mt-1">
                        <Rb_Input
                            id="email"
                            type="email"
                            placeholder={PLACEHOLDERS.EMAIL}
                            error={!!errors.email}
                            disabled={isEmailVerified}
                            {...register("email", {
                                required: VALIDATION_MESSAGES.EMAIL_REQUIRED,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: VALIDATION_MESSAGES.EMAIL_INVALID,
                                },
                            })}
                            className="rounded-lg !mt-0 !mb-0"
                            borderClass='border !border-gray-500'
                        />
                        {isEmailVerified ? (
                            <span className="text-green-600 text-sm font-semibold whitespace-nowrap">
                                {REGISTER_TEXT.VERIFIED_LABEL}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="text-blue-600 text-sm font-semibold underline whitespace-nowrap hover:text-blue-700 disabled:opacity-50"
                            >
                                {isSendingOtp ? REGISTER_TEXT.SENDING_OTP : REGISTER_TEXT.VERIFY_LINK}
                            </button>
                        )}
                    </div>
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
                    isLoading={registerMutation.isPending}
                >
                    {REGISTER_TEXT.SUBMIT_BUTTON}
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
                            <span className="font-medium text-gray-700">{watch("email")}</span>.
                        </Rb_Text>

                        <Rb_Input
                            type="text"
                            placeholder={PLACEHOLDERS.OTP}
                            value={otp}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                            className="rounded-lg !mt-0 !mb-0 w-full"
                            borderClass="border !border-gray-300"
                        />

                        <Rb_Button
                            type="button"
                            onClick={handleVerifyOtp}
                            isLoading={isVerifyingOtp}
                            className="w-full mt-4 !bg-blue-600 hover:!bg-blue-700 !text-white"
                        >
                            {REGISTER_TEXT.VERIFY_OTP_BUTTON}
                        </Rb_Button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowOtpModal(false);
                                setOtp("");
                            }}
                            className="text-gray-500 text-sm mt-3 underline block text-center w-full hover:text-gray-700"
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