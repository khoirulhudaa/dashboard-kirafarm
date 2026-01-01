// src/utils/authFetch.ts

import { useNavigate } from "react-router";
import { GetAuthToken } from "./token"; // asumsikan ini mengembalikan accessToken dari localStorage

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fungsi untuk refresh token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Refresh failed");

    const result = await response.json();
    if (!result.success || !result.data?.accessToken || !result.data?.refreshToken) {
      throw new Error("Invalid refresh response");
    }

    // Simpan token baru
    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);

    return true;
  } catch (error) {
    console.error("Refresh token gagal:", error);
    // Hapus token & logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Redirect ke login (sesuaikan route kamu)
    window.location.href = "/signin";
    return false;
  }
}

// Wrapper fetch dengan auto refresh
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let accessToken = GetAuthToken(); // atau langsung localStorage.getItem("accessToken")
  const navigate = useNavigate()

  // Tambahkan header Authorization jika ada token
  const headers = new Headers(init?.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(input, { ...init, headers });

  // Jika 401 → coba refresh token sekali saja
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      // Jika refresh gagal, langsung reject
      navigate('/signin')
      throw new Error("Session expired");
    }
    
    // Ulangi request dengan token baru
    accessToken = localStorage.getItem("accessToken");
    headers.set("Authorization", `Bearer ${accessToken!}`);

    response = await fetch(input, { ...init, headers });
  }

  return response;
}