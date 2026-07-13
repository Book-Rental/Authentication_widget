import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../services/authService";
import { RegisterFormData, RegisterPayload } from "../types/auth";
import { VALIDATION_MESSAGES, PLACEHOLDERS, REGISTER_TEXT } from "../constants";
import { Button, Rb_Input, Rb_Label, Rb_Text } from "rentbook-ui-lib";
import { showToast } from "../utils/showToast";
import { Button, Rb_Icon, Rb_Input, Rb_Label, Rb_Text } from "rentbook-ui-lib";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

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
        const payload: RegisterPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
        };

        registerMutation.mutate(payload);
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
                        className="absolute right-3 top-[55%] -translate-y-1/2 text-gray-500"
                    >
                        <Rb_Icon
                            icon={showPassword ? FaEyeSlash : FaEye}
                            size={15} color="#3b82f6"
                        />
                    </button>
                    <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                        {errors.confirmPassword?.message || ""}
                    </Rb_Text>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-1"
                    isLoading={registerMutation.isPending}
                >
                    {REGISTER_TEXT.SUBMIT_BUTTON}
                </Button>
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
        </div>
    );
};

export default Register;