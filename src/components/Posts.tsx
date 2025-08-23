
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "./Header";
import CommentForm from "./CommentForm";

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

type Comment = {
  id: number;
  body: string;
  author: Author;
};

const limit = 10;

function Posts() {
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<number | null>(null);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const queryClient = useQueryClient();
  

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetch(
        `https://tarmeezacademy.com/api/v1/posts?limit=${limit}&page=${pageParam}`
      );
      if (!result.ok) throw new Error("Failed to fetch posts");
      const json = await result.json();
      return {
        posts: json.data,
        nextPage: json.data.length < limit ? null : pageParam + 1,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const fetchComments = async (postId: number) => {
    setLoadingComments(postId);
    try {
      const result = await fetch(
        `https://tarmeezacademy.com/api/v1/posts/${postId}`
      );
      if (!result.ok) throw new Error("Failed to fetch comments");
      const json = await result.json();

      const comments = json.data.comments || [];
      setComments((prev) => ({ ...prev, [postId]: comments }));
      setShowComments((prev) => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments((prev) => ({ ...prev, [postId]: [] }));
      setShowComments((prev) => ({ ...prev, [postId]: true }));
    } finally {
      setLoadingComments(null);
    }
  };

  const handleCommentAdded = (postId: number) => {
    fetchComments(postId);
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const toggleComments = (postId: number) => {
    if (showComments[postId]) {
      setShowComments((prev) => ({ ...prev, [postId]: false }));
    } else {
      if (!comments[postId]) {
        fetchComments(postId);
      } else {
        setShowComments((prev) => ({ ...prev, [postId]: true }));
      }
    }
  };

  if (status === "pending") {
    return <p className="text-center text-white">Loading posts...</p>;
  }

  if (status === "error") {
    return (
      <p className="text-center text-red-500">
        Error: {(error as Error).message}
      </p>
    );
  }

  return (
    <>
      <Header btnText="Sign In / Sign Up" />
      <div className="container mx-auto py-10 px-4 mt-10 space-y-6 ">
        {data?.pages.map((page) =>
          page.posts.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white/10 backdrop-blur mx-auto p-6 text-left rounded-xl shadow-2xl w-full lg:w-[60%] "
            >
              <div className="flex items-center gap-3 mb-8 text-left">
                {!imageError[post.author.id] &&
                typeof post.author.profile_image === "string" &&
                post.author.profile_image.startsWith("http") ? (
                  <img
                    src={post.author.profile_image}
                    alt={post.author.name}
                    className="w-15 h-15 rounded-full object-cover mr-2"
                    onError={() =>
                      setImageError((prev) => ({
                        ...prev,
                        [post.author.id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="w-15 h-15 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg
                      fill="#ffffff"
                      width="full"
                      height="full"
                      viewBox="0 0 30.586 30.586"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g transform="translate(-546.269 -195.397)">
                        <path d="M572.138,221.245a15.738,15.738,0,0,0-21.065-.253l-1.322-1.5a17.738,17.738,0,0,1,23.741.28Z" />

                        <path d="M561.464,204.152a4.96,4.96,0,1,1-4.96,4.96,4.966,4.966,0,0,1,4.96-4.96m0-2a6.96,6.96,0,1,0,6.96,6.96,6.96,6.96,0,0,0-6.96-6.96Z" />

                        <path d="M561.562,197.4a13.293,13.293,0,1,1-13.293,13.293A13.308,13.308,0,0,1,561.562,197.4m0-2a15.293,15.293,0,1,0,15.293,15.293A15.293,15.293,0,0,0,561.562,195.4Z" />
                      </g>
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-bold text-white">{post.author.name}</p>
                  <p className="text-sm text-gray-400">{post.created_at}</p>
                </div>
              </div>

              {post.title && (
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {post.title}
                </h3>
              )}
              <p className="mb-3 text-gray-300  break-words whitespace-normal overflow-hidden">
                {post.body}
              </p>

              {typeof post.image === "string" &&
                (post.image.startsWith("http") ||
                  post.image.startsWith("blob:")) && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full mx-h-200 rounded-md object-contain mb-3"
                  />
                )}

              <div className="text-sm text-gray-400 flex justify-between pt-2 border-t border-[#3a3b3c]">
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 hover:underline hover:text-white cursor-pointer transition"
                >
                  <svg
                    width="35px"
                    height="35px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.82698 7.13803L5.27248 7.36502L4.82698 7.13803ZM5.2682 18.7318L5.62175 19.0854H5.62175L5.2682 18.7318ZM17.862 16.173L17.635 15.7275L17.862 16.173ZM19.173 14.862L18.7275 14.635L19.173 14.862ZM19.173 7.13803L18.7275 7.36502V7.36502L19.173 7.13803ZM17.862 5.82698L18.089 5.38148V5.38148L17.862 5.82698ZM6.13803 5.82698L6.36502 6.27248L6.13803 5.82698ZM7.20711 16.7929L7.56066 17.1464L7.20711 16.7929ZM5 10.3C5 9.45167 5.00039 8.84549 5.03921 8.37032C5.07756 7.90099 5.15089 7.60366 5.27248 7.36502L4.38148 6.91103C4.17609 7.31413 4.08593 7.75771 4.04253 8.28889C3.99961 8.81423 4 9.46817 4 10.3H5ZM5 11.5V10.3H4V11.5H5ZM4 11.5V16.5H5V11.5H4ZM4 16.5V18.4136H5V16.5H4ZM4 18.4136C4 19.26 5.02329 19.6838 5.62175 19.0854L4.91465 18.3782C4.91754 18.3753 4.92812 18.368 4.94323 18.3654C4.9556 18.3632 4.96421 18.3654 4.96913 18.3674C4.97406 18.3695 4.98164 18.374 4.98888 18.3843C4.99771 18.3968 5 18.4095 5 18.4136H4ZM5.62175 19.0854L7.56066 17.1464L6.85355 16.4393L4.91465 18.3782L5.62175 19.0854ZM14.7 16H7.91421V17H14.7V16ZM17.635 15.7275C17.3963 15.8491 17.099 15.9224 16.6297 15.9608C16.1545 15.9996 15.5483 16 14.7 16V17C15.5318 17 16.1858 17.0004 16.7111 16.9575C17.2423 16.9141 17.6859 16.8239 18.089 16.6185L17.635 15.7275ZM18.7275 14.635C18.4878 15.1054 18.1054 15.4878 17.635 15.7275L18.089 16.6185C18.7475 16.283 19.283 15.7475 19.6185 15.089L18.7275 14.635ZM19 11.7C19 12.5483 18.9996 13.1545 18.9608 13.6297C18.9224 14.099 18.8491 14.3963 18.7275 14.635L19.6185 15.089C19.8239 14.6859 19.9141 14.2423 19.9575 13.7111C20.0004 13.1858 20 12.5318 20 11.7H19ZM19 10.3V11.7H20V10.3H19ZM18.7275 7.36502C18.8491 7.60366 18.9224 7.90099 18.9608 8.37032C18.9996 8.84549 19 9.45167 19 10.3H20C20 9.46817 20.0004 8.81423 19.9575 8.28889C19.9141 7.75771 19.8239 7.31413 19.6185 6.91103L18.7275 7.36502ZM17.635 6.27248C18.1054 6.51217 18.4878 6.89462 18.7275 7.36502L19.6185 6.91103C19.283 6.25247 18.7475 5.71703 18.089 5.38148L17.635 6.27248ZM14.7 6C15.5483 6 16.1545 6.00039 16.6297 6.03921C17.099 6.07756 17.3963 6.15089 17.635 6.27248L18.089 5.38148C17.6859 5.17609 17.2423 5.08593 16.7111 5.04253C16.1858 4.99961 15.5318 5 14.7 5V6ZM9.3 6H14.7V5H9.3V6ZM6.36502 6.27248C6.60366 6.15089 6.90099 6.07756 7.37032 6.03921C7.84549 6.00039 8.45167 6 9.3 6V5C8.46817 5 7.81423 4.99961 7.28889 5.04253C6.75771 5.08593 6.31413 5.17609 5.91103 5.38148L6.36502 6.27248ZM5.27248 7.36502C5.51217 6.89462 5.89462 6.51217 6.36502 6.27248L5.91103 5.38148C5.25247 5.71703 4.71703 6.25247 4.38148 6.91103L5.27248 7.36502ZM7.56066 17.1464C7.65443 17.0527 7.78161 17 7.91421 17V16C7.51639 16 7.13486 16.158 6.85355 16.4393L7.56066 17.1464Z"
                      fill="#ffffff"
                    />
                    <path
                      d="M8.5 9.5L15.5 9.5"
                      stroke="#ffffff"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8.5 12.5L13.5 12.5"
                      stroke="#ffffff"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {post.comments_count} Comments{" "}
                  {showComments[post.id] ? "▼" : "▶"}
                </button>
              </div>

              {/* Loading state for comments */}
              {loadingComments === post.id && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <p className="text-gray-300 ml-2">Loading comments...</p>
                </div>
              )}

              {/* Show comments */}
              {showComments[post.id] && comments[post.id] && (
                <div className="mt-4">
                  {comments[post.id].length > 0 ? (
                    <div className="space-y-3 mb-4">
                      <h4 className="text-white font-semibold text-sm">
                        Comments:
                      </h4>
                      {comments[post.id].map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start bg-gray-800/30 p-3 rounded-lg"
                        >
                          {comment.author?.profile_image &&
                          !imageError?.[comment.id] &&
                          typeof comment.author.profile_image === "string" &&
                          comment.author.profile_image.startsWith("http") ? (
                            <img
                              src={comment.author.profile_image}
                              alt={comment.author?.name || "User"}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-4"
                              onError={() =>
                                setImageError((prev) => ({
                                  ...prev,
                                  [comment.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                              <svg
                                fill="#ffffff"
                                width="full"
                                height="full"
                                viewBox="0 0 30.586 30.586"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g transform="translate(-546.269 -195.397)">
                                  <path d="M572.138,221.245a15.738,15.738,0,0,0-21.065-.253l-1.322-1.5a17.738,17.738,0,0,1,23.741.28Z" />
                                  <path d="M561.464,204.152a4.96,4.96,0,1,1-4.96,4.96,4.966,4.966,0,0,1,4.96-4.96m0-2a6.96,6.96,0,1,0,6.96,6.96,6.96,6.96,0,0,0-6.96-6.96Z" />
                                  <path d="M561.562,197.4a13.293,13.293,0,1,1-13.293,13.293A13.308,13.308,0,0,1,561.562,197.4m0-2a15.293,15.293,0,1,0,15.293,15.293A15.293,15.293,0,0,0,561.562,195.4Z" />
                                </g>
                              </svg>
                            </div>
                          )}

                          <div className="text-left flex-1 min-w-0">
                            <p className="text-white font-semibold text-lg truncate">
                              {comment.author?.name || "Anonymous user"}
                            </p>
                            <p className="text-gray-300 text-sm break-words whitespace-normal">
                              {comment.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">No comments yet</p>
                    </div>
                  )}

                  {/* Add New Comment Form */}
                  <CommentForm
                    postId={post.id}
                    onCommentAdded={() => handleCommentAdded(post.id)}
                  />
                </div>
              )}
            </div>
          ))
        )}

        {hasNextPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Posts;
