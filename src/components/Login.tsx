import { useForm } from "react-hook-form";
import { LoginFormData } from "../types/auth";
import { LOGIN_CONSTANTS } from "../constants";
import { useLogin } from "../hook/useLogin";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { showToast } from "../utils/showToast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { Rb_Button, Rb_Icon, Rb_Input, Rb_Label, Rb_Text } from "@rentbook/rentbook-ui-lib";

interface LoginProps {
    isLogin: boolean;
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
    options: {
        containerElementId: string;
        name?: string;
    };
}

const Login = ({ isLogin, setIsLogin }: LoginProps) => {
    const { mutateAsync, isPending } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<LoginFormData>();

    useEffect(() => {
        if (isLogin) {
            reset();
        }
    }, [isLogin, reset]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await mutateAsync(data);
            const { token, userInfo } = response.data;

         
            // localStorage.setItem("user", JSON.stringify(userInfo));
            window.dispatchEvent(
                new CustomEvent("login-widget-success", {
                    detail: {
                        token,
                        userInfo,
                    },
                })
            );
            showToast("Login successful!", "success");
        } catch (error: unknown) {
            console.error(error);
            const axiosError = error as AxiosError<{ message: string }>;
            showToast(
                axiosError.response?.data?.message ??
                LOGIN_CONSTANTS.VALIDATION.INVALID_CREDENTIALS,
                "error"
            );
        }
    };

    return (
        <div className="px-6 py-1 flex flex-col justify-center">
            <div className="mb-1.5 text-center">
                <Rb_Text variant="h2">
                    {LOGIN_CONSTANTS.TITLE}
                </Rb_Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <Rb_Label htmlFor="email" required className="text-sm">
                        Email Address
                    </Rb_Label>

                    <Rb_Input
                        id="email"
                        type="email"
                        placeholder={LOGIN_CONSTANTS.EMAIL_PLACEHOLDER}
                        className="!mt-1 !mb-0 rounded-lg"
                        borderClass='border !border-gray-500'
                        error={!!errors.email}
                        {...register("email", {
                            required: LOGIN_CONSTANTS.VALIDATION.EMAIL_REQUIRED,
                            pattern: {
                                value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                                message: LOGIN_CONSTANTS.VALIDATION.EMAIL_INVALID,
                            },
                        })}
                    />

                    <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                        {errors.email?.message || ""}
                    </Rb_Text>
                </div>
                <div>
                    <div className="relative">
                        <Rb_Label htmlFor="password" required className="text-sm">
                            Password
                        </Rb_Label>

                        <Rb_Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={LOGIN_CONSTANTS.PASSWORD_PLACEHOLDER}
                            className="!mt-1 !mb-0 rounded-lg pr-10"
                            borderClass='border !border-gray-500'
                            error={!!errors.password}
                            {...register("password", {
                                required: LOGIN_CONSTANTS.VALIDATION.PASSWORD_REQUIRED,
                            })}
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
                </div>
                <div className="flex justify-center">
                    <Rb_Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isPending}
                        className="w-full mt-1"
                    >
                        {isPending
                            ? LOGIN_CONSTANTS.LOGIN_BUTTON_LOADING
                            : LOGIN_CONSTANTS.LOGIN_BUTTON}
                    </Rb_Button>
                </div>

                <div className="text-center text-sm mt-2">
                    <Rb_Text variant="span">
                        {LOGIN_CONSTANTS.DONT_HAVE_ACCOUNT}{" "}
                    </Rb_Text>

                    <Rb_Text
                        variant="span"
                        className="text-blue-600 font-semibold cursor-pointer inline"
                        onClick={() => setIsLogin(false)}
                    >
                        {LOGIN_CONSTANTS.REGISTER}
                    </Rb_Text>
                </div>
            </form>
        </div>
    );
};

export default Login;