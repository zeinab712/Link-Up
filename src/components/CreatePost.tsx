import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Author = {
  id: number;
  name: string;
  username: string;
  profile_image: string;
};

type Post = {
  id: number;
  title: string | null;
  body: string;
  image?: string;
  created_at: string;
  comments_count: number;
  author: Author;
};

type InfinitePostsData = {
  pages: {
    posts: Post[];
    nextPage: number | null;
  }[];
  pageParams: number[];
};

const createPostSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1, "Post content is required"),
  image: z
    .any()
    .optional()
    .refine((file) => {
      if (!file || file.length === 0) return true;
      return file[0].size <= 2 * 1024 * 1024;
    }, "Max image size is 2MB")
    .refine((file) => {
      if (!file || file.length === 0) return true;
      return file[0].type.startsWith("image/");
    }, "Only images are allowed"),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

const createPostAPI = async (data: FormData): Promise<Post> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not authenticated.");

  try {
    const res = await fetch("https://tarmeezacademy.com/api/v1/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    if (!res.ok) {
      const errorJson = await res.json();
      throw new Error(errorJson.message || "Failed to create post.");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error creating post with real API:", error);
    throw error;
  }
};

function CreatePost() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
  });
  watch((values) => console.log(values));

  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: createPostAPI,
    onSuccess: (newPost) => {
      queryClient.setQueryData(
        ["posts"],
        (oldData: InfinitePostsData | undefined) => {
          if (!oldData) {
            return {
              pages: [{ posts: [newPost], nextPage: null }],
              pageParams: [1],
            };
          }

          const newPages = [...oldData.pages];
          if (newPages.length === 0) {
            newPages.push({ posts: [], nextPage: null });
          }

          newPages[0] = {
            ...newPages[0],
            posts: [newPost, ...newPages[0].posts],
          };

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
      reset();
      setPreview(null);
      navigate("/home");
    },
    onError: (err) => {
      console.error("Error creating post:", err);
    },
  });

  const handleFormSubmit = (data: CreatePostFormValues) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    formData.append("body", data.body);
    if (data.image && data.image.length > 0) {
      formData.append("image", data.image[0]);
    }

    mutate(formData);
  };

  return (
    <div className="bg-white/10 backdrop-blur mx-auto p-6 rounded-xl shadow-2xl w-full my-20 text-left">
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        Create a New Post
      </h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2 mt-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-white"
          >
            Title (Optional)
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="mt-1 w-full rounded-md border border-transparent bg-white/5 py-2 px-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="space-y-2 mt-6">
          <label
            htmlFor="body"
            className="block text-sm font-medium text-white"
          >
            Content
          </label>
          <textarea
            id="body"
            rows={4}
            {...register("body")}
            className="mt-1 w-full rounded-md border border-transparent bg-white/5 py-2 px-3 text-white placeholder-gray-500 
focus:border-blue-500 focus:ring-0 focus:outline-none resize-none"
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-500">{errors.body.message}</p>
          )}
        </div>

        {/* image input */}
        <div className="relative mt-8 w-full flex flex-col items-center justify-center border-3 border-dashed border-gray-400 py-2 px-3 rounded-lg min-h-[100px]">
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
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />
          {!preview && (
            <div className="text-center  text-white/40">
              <svg
                className="mx-auto mb-3"
                width="80px"
                height="80px"
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
              <p>Drag & Drop an image here or click to select</p>
            </div>
          )}
          {preview && (
            <img
              src={preview}
              alt="Image preview"
              className="w-full max-h-100 mx-auto rounded-lg object-contain border border-[#1957a4]"
            />
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-500">
              {errors.image?.message as string}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
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
              Posting...
            </span>
          ) : (
            "Create Post"
          )}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
