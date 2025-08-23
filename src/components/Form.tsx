import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

export type FormValues = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  image?: FileList;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  name: string;
  email: string;
  image?: File;
};

const buildSchema = (
  includeName?: boolean,
  includeUsername?: boolean,
  includeEmail?: boolean,
  includePassword?: boolean,
  includeConfirmPassword?: boolean,
  includeImage?: boolean
) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (includeName) {
    shape.name = z.string().min(2, "Name is required");
  }
  if (includeUsername) {
    shape.username = z
      .string()
      .min(3, "Username must be at least 3 characters");
  }
  if (includeEmail) {
    shape.email = z.string().email("Enter a valid email address");
  }
  if (includePassword) {
    shape.password = z
      .string()
      .min(6, "Password must be at least 6 characters");
  }
  if (includeConfirmPassword) {
    shape.confirmPassword = z.string();
  }
  if (includeImage) {
    shape.image = z
      .any()
      .optional()
      .refine(
        (file) =>
          !file || file?.length === 0 || file[0]?.size <= 2 * 1024 * 1024,
        "Max file size is 2MB"
      )
      .refine(
        (file) =>
          !file || file?.length === 0 || file[0]?.type.startsWith("image/"),
        "Only images are allowed"
      );
  }

  let schema = z.object(shape);

  if (includePassword && includeConfirmPassword) {
    schema = schema.refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }

  return schema;
};

//Login function to authenticate user
const loginUser = async (data: LoginData) => {
  const response = await fetch("https://tarmeezacademy.com/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Invalid Username or Password");
  }

  return await response.json();
};

// New user registration
const registerUser = async (data: RegisterData) => {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("password", data.password);
  formData.append("name", data.name);
  formData.append("email", data.email);

  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await fetch("https://tarmeezacademy.com/api/v1/register", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return await response.json();
};

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const includeName = !isLogin;
  const includeUsername = true;
  const includeEmail = !isLogin;
  const includePassword = true;
  const includeConfirmPassword = !isLogin;
  const includeImage = !isLogin;

  const formSchema = buildSchema(
    includeName,
    includeUsername,
    includeEmail,
    includePassword,
    includeConfirmPassword,
    includeImage
  );

  type AllFormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AllFormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = async (data: FormValues) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      let response;

      if (isLogin) {
        // login
        const loginData: LoginData = {
          username: data.username as string,
          password: data.password as string,
        };
        response = await loginUser(loginData);
      } else {
        // create account
        const registerData: RegisterData = {
          username: data.username as string,
          password: data.password as string,
          name: data.name as string,
          email: data.email as string,
          image: data.image?.[0] || undefined,
        };
        response = await registerUser(registerData);
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.user.id,
          name: response.user.name || response.user.username,
          username: response.user.username,
          email: response.user.email,
          profileImage: response.user.profile_image || preview || null,
        })
      );

      reset();
      setPreview(null);

      navigate("/home");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // preview image logic
  const image = watch("image") as FileList | undefined;

  useEffect(() => {
    if (image && image.length > 0 && !preview) {
      setPreview(URL.createObjectURL(image[0]));
    }
  }, [image, preview]);

  return (
    <div className="min-h-full w-full flex items-center justify-center px-4 my-4">
      <div className="w-full flex flex-col items-center">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="w-full text-left bg-white/10 rounded-xl shadow-lg p-8 space-y-2 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="w-13 h-13 mb-4 text-[#2d85f0]"
              fill="currentColor"
              viewBox="0 0 30.586 30.586"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(-546.269 -195.397)">
                <path d="M572.138,221.245a15.738,15.738,0,0,0-21.065-.253l-1.322-1.5a17.738,17.738,0,0,1,23.741.28Z" />
                <path d="M561.464,204.152a4.96,4.96,0,1,1-4.96,4.96,4.966,4.966,0,0,1,4.96-4.96m0-2a6.96,6.96,0,1,0,6.96,6.96,6.96,6.96,0,0,0-6.96-6.96Z" />
                <path d="M561.562,197.4a13.293,13.293,0,1,1-13.293,13.293A13.308,13.308,0,0,1,561.562,197.4m0-2a15.293,15.293,0,1,0,15.293,15.293A15.293,15.293,0,0,0,561.562,195.4Z" />
              </g>
            </svg>
            <h2 className="text-2xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <h2 className="text-gray-300 text-sm mb-4">
              {isLogin
                ? "Enter your username and password to sign in"
                : "Fill in your details to register"}
            </h2>
          </div>

          {/* global Error */}
          {authError && (
            <div className="text-red-500 text-center p-2 bg-red-50 rounded">
              {authError}
            </div>
          )}

          {/* form fields*/}
          {includeName && (
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <div className="relative w-full">
                <input
                  type="text"
                  {...register("name")}
                  className="w-full border border-[#1957a4] pl-10 py-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-[#2d85f0] focus:outline-none transition duration-300"
                  placeholder="Enter your full name"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d85f0] pointer-events-none"
                  width="20"
                  height="20"
                  viewBox="0 0 15 15"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"
                  />
                </svg>
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          {includeUsername && (
            <div>
              <label className="block mb-1 font-medium">Username</label>
              <div className="relative w-full">
                <input
                  type="text"
                  {...register("username")}
                  className="w-full border border-[#1957a4] pl-10 py-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-[#2d85f0] focus:outline-none transition duration-300"
                  placeholder="Enter your username"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d85f0] pointer-events-none"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
          )}

          {includeEmail && (
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <div className="relative w-full">
                <input
                  type="email"
                  {...register("email")}
                  className="w-full border border-[#1957a4] px-10 py-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-[#2d85f0] focus:outline-none transition duration-300"
                  placeholder="Enter your email"
                />
                <svg
                  width="20px"
                  height="20px"
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="style=linear">
                    <g id="email">
                      <path
                        d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
                        stroke="#2d85f0"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.7698 7.7688L13.2228 12.0551C12.5025 12.6116 11.4973 12.6116 10.777 12.0551L5.22998 7.7688"
                        stroke="#2d85f0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                </svg>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {includePassword && (
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <div className="relative w-full">
                <input
                  type="password"
                  {...register("password")}
                  className="w-full border border-[#1957a4] px-35 pl-10 py-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-[#2d85f0] focus:outline-none transition duration-300"
                  placeholder="Enter your password"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d85f0] pointer-events-none"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17,9V7A5,5,0,0,0,7,7V9a3,3,0,0,0-3,3v7a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V12A3,3,0,0,0,17,9ZM9,7a3,3,0,0,1,6,0V9H9Zm9,12a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1Z" />
                </svg>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {includeConfirmPassword && (
            <div>
              <label className="block mb-1 font-medium">Confirm Password</label>
              <div className="relative w-full">
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full border border-[#1957a4] px-10 py-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-[#2d85f0] focus:outline-none transition duration-300"
                  placeholder="Confirm your password"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d85f0] pointer-events-none"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17,9V7A5,5,0,0,0,7,7V9a3,3,0,0,0-3,3v7a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V12A3,3,0,0,0,17,9ZM9,7a3,3,0,0,1,6,0V9H9Zm9,12a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V12a1,1,0,0,1,1,1Z" />
                </svg>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {includeImage && (
            <div className="relative mt-8 w-full flex flex-col border-3 border-dashed border-gray-400 py-2 px-3 rounded-lg">
              <label className="block mb-2 font-medium">
                Profile Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                  } else {
                    setPreview(null);
                  }
                }}
                className="absolute w-full h-full mx-[-11px] my-[-9px] rounded-lg bg-white/10 text-white/40 cursor-pointer py-4 px-9 opacity-0"
              />

              <div className="flex flex-col items-center justify-center py-8">
                {!preview ? (
                  <>
                    <svg
                      className="text-white/40 mb-4"
                      width="160px"
                      height="160px"
                      viewBox="0 0 15 15"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z"
                      />
                    </svg>
                    <p className="text-white/60 text-sm text-center">
                      Click to upload profile image
                      <br />
                      <span className="text-xs">
                        Optional - PNG, JPG up to 2MB
                      </span>
                    </p>
                  </>
                ) : (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-32 h-32 rounded-lg object-cover border border-[#1957a4]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        const fileInput = document.querySelector(
                          'input[type="file"]'
                        ) as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = "";
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer transition duration-200"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {errors.image && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.image.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 mt-6 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="my-6 text-sm text-gray-300">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthError(null);
              setPreview(null);
              reset();
            }}
            className="text-[#2072d6] underline cursor-pointer hover:text-blue-400 transition"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
