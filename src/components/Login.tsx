import { useForm } from "react-hook-form";
import { LoginFormData } from "../types/auth";
import toast from "react-hot-toast";
import { LOGIN_CONSTANTS } from "../constants";
import { useLogin } from "../hook/useLogin";
import { Rb_Input, Rb_Text, Rb_Label, Button } from "rentbook-ui-lib";
import { AxiosError } from "axios";
import { useEffect } from "react";

interface LoginProps {
    isLogin: boolean;
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login = ({ isLogin, setIsLogin }: LoginProps) => {
    const { mutateAsync, isPending } = useLogin();

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

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userInfo));
            toast.success("Login successful!");
        } catch (error: unknown) {
            console.error(error);
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error(
                axiosError.response?.data?.message ||
                LOGIN_CONSTANTS.VALIDATION.INVALID_CREDENTIALS
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
                    <Rb_Label htmlFor="password" required className="text-sm">
                        Password
                    </Rb_Label>

                    <Rb_Input
                        id="password"
                        type="password"
                        placeholder={LOGIN_CONSTANTS.PASSWORD_PLACEHOLDER}
                        className="!mt-1 !mb-0 rounded-lg"
                        borderClass='border !border-gray-500'
                        error={!!errors.password}
                        {...register("password", {
                            required: LOGIN_CONSTANTS.VALIDATION.PASSWORD_REQUIRED,
                        })}
                    />

                    <Rb_Text variant="p" className="text-red-500 text-xs leading-tight h-4 mt-0.5">
                        {errors.password?.message || ""}
                    </Rb_Text>
                </div>

                <div className="flex justify-center">
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isPending}
                        className="w-full mt-1"
                    >
                        {isPending
                            ? LOGIN_CONSTANTS.LOGIN_BUTTON_LOADING
                            : LOGIN_CONSTANTS.LOGIN_BUTTON}
                    </Button>
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