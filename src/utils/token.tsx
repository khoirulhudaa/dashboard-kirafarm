// src/utils/token.ts
export function GetAuthToken(): string | null {
  return localStorage.getItem("accessToken");
}

// Opsional: fungsi untuk set token setelah login
export function SetAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}