import { useForm } from "react-hook-form";
import { LoginFormData } from "../types/auth";
import toast from "react-hot-toast";
import { LOGIN_CONSTANTS } from "../constants";
import { useLogin } from "../hook/useLogin";
import 'rentbook/microfrontend.min.css'
import { Button, Rb_Input, Rb_Label, Rb_Text } from "rentbook";

interface LoginProps {
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login = ({ setIsLogin }: LoginProps) => {
    const { mutateAsync, isPending } = useLogin();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await mutateAsync(data);

            const { token, userInfo } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userInfo));
            toast.success("Login successful!");

        } catch (error: any) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                LOGIN_CONSTANTS.VALIDATION.INVALID_CREDENTIALS
            );
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Rb_Text variant="h2">
                    {LOGIN_CONSTANTS.TITLE}
                </Rb_Text>

                <Rb_Text variant="p"
                    className="text-slate-500 mt-1">
                    {LOGIN_CONSTANTS.SUBTITLE}
                </Rb_Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} >

                <div>
                    <Rb_Label htmlFor="email" required className="text-sm">
                        Email Address
                    </Rb_Label>

                    <Rb_Input
                        id="email"
                        type="email"
                        placeholder={LOGIN_CONSTANTS.EMAIL_PLACEHOLDER}

                        className="!mt-1 !mb-1 border !border-gray-300 rounded-lg"
                        error={!!errors.email}
                        {...register("email", {
                            required: LOGIN_CONSTANTS.VALIDATION.EMAIL_REQUIRED,
                            pattern: {
                                value:
                                    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                                message: LOGIN_CONSTANTS.VALIDATION.EMAIL_INVALID,
                            },
                        })}
                    />

                    {errors.email && (
                        <Rb_Text
                            variant="p"
                            className="text-red-500 text-sm"
                        >
                            {errors.email.message}
                        </Rb_Text>
                    )}
                </div>

                <div>
                    <Rb_Label htmlFor="password" required className="text-sm">
                        Password
                    </Rb_Label>

                    <Rb_Input
                        id="password"
                        type="password"
                        placeholder={LOGIN_CONSTANTS.PASSWORD_PLACEHOLDER}
                        className="!mt-1 !mb-1 border !border-gray-300 rounded-lg"
                        error={!!errors.password}
                        {...register("password", {
                            required: LOGIN_CONSTANTS.VALIDATION.PASSWORD_REQUIRED,
                        })}
                    />

                    {errors.password && (
                        <Rb_Text
                            variant="p"
                            className="text-red-500 text-sm"
                        >
                            {errors.password.message}
                        </Rb_Text>
                    )}
                </div>

                <div className="flex justify-center">
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isPending}
                        className="w-full mt-4"
                    >
                        {isPending
                            ? LOGIN_CONSTANTS.LOGIN_BUTTON_LOADING
                            : LOGIN_CONSTANTS.LOGIN_BUTTON}
                    </Button>
                </div>

                <div className="text-center text-sm mt-3">
                    <Rb_Text variant="span">
                        {LOGIN_CONSTANTS.DONT_HAVE_ACCOUNT}{" "}
                    </Rb_Text>

                    <Rb_Text
                        variant="span"
                        className="text-blue-600 font-semibold cursor-pointer inline"
                        onClick={() => {
                            reset();
                            setIsLogin(false);
                        }}
                    >
                        {LOGIN_CONSTANTS.REGISTER}
                    </Rb_Text>
                </div>

            </form>
        </div>
    );
};

export default Login;