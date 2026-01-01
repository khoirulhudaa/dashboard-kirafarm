import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { toast } from "sonner";

// Ganti dengan URL backend kamu (local atau production)
const API_BASE_URL = "http://localhost:5000/api"; // Ubah ke domain production nanti

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    // Validasi sederhana
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email dan kata sandi wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Simpan token dan user ke localStorage
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(`Selamat datang kembali, ${data.user.name}!`);

        // Redirect ke dashboard
        navigate("/", { replace: true });
      } else {
        setErrorMessage(data.message || "Email atau kata sandi salah");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="relative top-[-10px]">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Masuk ke KiraFarm
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan email dan kata sandi untuk mengakses dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="contoh: admin@kirafarm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>

            <div>
              <Label>
                Kata Sandi <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button
                // type="submit"
                className="w-full"
                // size="lg"
                disabled={loading}
              >
                {loading ? "Sedang masuk..." : "Masuk"}
              </Button>
            </div>
          </form>

          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Daftar di sini
              </button>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}