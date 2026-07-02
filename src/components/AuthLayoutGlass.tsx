import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import background from "../assets/glassybackground.png";
import { Rb_Text } from "rentbook-ui-lib";
import { AUTH_LAYOUT_TEXT } from "../constants";
import { FiBookOpen } from "react-icons/fi";

interface AuthLayoutGlassProps {
  options: {
    containerElementId: string;
    name?: string;
  };
}

const AuthLayoutGlass = ({ options }: AuthLayoutGlassProps) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div
      className="h-screen w-full overflow-hidden bg-cover bg-center flex items-center justify-center px-3 py-4 sm:px-6"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />

      <style>{`
        .auth-card {
          max-height: 96vh;
          overflow-y: auto;
        }

        .auth-card::-webkit-scrollbar {
          display: none;
        }

        .auth-card {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (max-height: 700px) {
          .auth-card {
            padding: 12px !important;
          }

          .auth-card h1 {
            font-size: 1rem !important;
          }

          .auth-card .auth-sub {
            margin-bottom: 0 !important;
            font-size: 0.65rem !important;
          }

          .auth-card .auth-tabs {
            margin-bottom: 4px !important;
          }
        }

        @media (max-height: 600px) {
          .auth-card {
            padding: 10px !important;
          }
        }

        @media (max-width: 360px) {
          .auth-card {
            padding: 12px !important;
          }

          .auth-card h1 {
            font-size: 0.95rem !important;
          }
        }
      `}</style>

      <div className="auth-card relative z-10 w-full max-w-[420px] sm:max-w-md rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl shadow-xl p-4 sm:p-5 opacity-80 flex flex-col">
        <div className="flex flex-col items-center mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <FiBookOpen />
            <Rb_Text
              variant="h1"
              className="text-lg sm:text-xl font-extrabold text-slate-900"
            >
              {AUTH_LAYOUT_TEXT.APP_NAME}{" "}
              <Rb_Text variant="span" className="text-blue-500">
                {AUTH_LAYOUT_TEXT.APP_NAME_HIGHLIGHT}
              </Rb_Text>
            </Rb_Text>
          </div>

          <Rb_Text
            variant="p"
            className="auth-sub text-slate-500 text-xs mt-0.5"
          >
            {AUTH_LAYOUT_TEXT.TAGLINE}
          </Rb_Text>
        </div>

        <div className="auth-tabs flex justify-center gap-8 sm:gap-10 border-b border-slate-300/40 mb-2 shrink-0">
          <button
            onClick={() => setIsLogin(true)}
            className={`pb-1.5 text-sm font-medium transition border-b-2 ${isLogin
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
          >
            {AUTH_LAYOUT_TEXT.LOGIN_TAB}
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`pb-1.5 text-sm font-medium transition border-b-2 ${!isLogin
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
          >
            {AUTH_LAYOUT_TEXT.REGISTER_TAB}
          </button>
        </div>

        <div className="grid min-h-0">
          <div
            className={`col-start-1 row-start-1 ${isLogin
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
              }`}
          >
            <Login isLogin={isLogin} setIsLogin={setIsLogin} options={options} />
          </div>

          <div
            className={`col-start-1 row-start-1 ${!isLogin
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
              }`}
          >
            <Register
              isLogin={isLogin}
              setIsLogin={setIsLogin}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayoutGlass;