import React, { useState } from "react";
const createComment = async (postId: number, body: string, token: string) => {
  const result = await fetch(
    `https://tarmeezacademy.com/api/v1/posts/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!result.ok) {
    const errorData = await result.json();
    throw new Error(errorData.message || "Failed to create comment");
  }

  return await result.json();
};
function CommentForm({
  postId,
  onCommentAdded,
}: {
  postId: number;
  onCommentAdded: () => void;
}) {
  const [commentTxt, setCommentTxt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;
  const token = localStorage.getItem("token");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentTxt.trim() || !token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createComment(postId, commentTxt.trim(), token);
      setCommentTxt("");
      onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !token) {
    return (
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg text-center">
        <p className="text-gray-400 text-sm">Log in to comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex gap-3 items-start">
        {user.profileImage && !imageError ? (
          <img
            src={user.profileImage}
            alt={user.name}
            className="mt-4 w-8 h-8 rounded-full object-cover  border border-blue-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="mt-4 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
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

        <div className="flex-1">
          <textarea
            value={commentTxt}
            onChange={(e) => setCommentTxt(e.target.value)}
            placeholder="Leave a comment..."
            className="mt-4 w-full h-25 p-2 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
            rows={2}
            disabled={isSubmitting}
          />

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!commentTxt.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-900 border border-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
            >
              {isSubmitting ? "Sending..." : "Comment"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default CommentForm;
