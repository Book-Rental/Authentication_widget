import axios from "axios";
import { LoginFormData, RegisterPayload } from "../types/auth";

const BASE_URL = "https://be-book-rental.onrender.com/api";

export const registerUser = async (
  userData: RegisterPayload
) => {
  const response = await fetch(`${BASE_URL}/user/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

export const loginUser = async (payload: LoginFormData) => {
  const response = await axios.post(
    `${BASE_URL}/auth/login`,
    payload,
    {
      withCredentials: true
    }
  );

  return response.data;
};


export interface SendOtpPayload {
  email: string;
  name: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export const sendOtp = async (payload: SendOtpPayload) => {
  const response = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }

  return data;
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Invalid OTP");
  }

  return data;
};
