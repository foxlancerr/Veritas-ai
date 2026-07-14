import { useState } from "react";
import emptyDp from "../assets/emptyDp.jpg";
import moment from "moment";
import { BiSolidLike } from "react-icons/bi";
import { BiLike } from "react-icons/bi";
import { FaRegCommentDots } from "react-icons/fa6";
import { LuSendHorizontal } from "react-icons/lu";
import axios from "axios";
import { useContext } from "react";
import { socket, UserDataContext } from "../context/UserContext";
import { useEffect } from "react";
import ConnectionButton from "./ConnectionButton";
import { useNavigate } from "react-router-dom";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";
import { RiAiGenerate } from "react-icons/ri";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import apiHelpers from "../../api/apiHelper";
import PostActions from "./PostAction";



const Posts = ({
  id,
  description,
  author,
  image,
  like,
  comment,
  createdAt,
}) => {
  const { userData, handleGetProfile, onlineUsers } = useContext(UserDataContext);
  const [readMore, setReadMore] = useState(false);
  const [likes, setLikes] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const navigate = useNavigate();

  // post like fucntion
  const handleLikePost = async () => {
    try {
      const response = await apiHelpers.get(`/post/like/${id}`, {
        withCredentials: true,
      });

      console.log("like response", response);

      setLikes(response.like || []); //
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  // post comment fucntion
  const handleCommentPost = async (e) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      return; // prevent empty or whitespace-only comments
    }

    try {
      const response = await apiHelpers.post(
        `/post/comment/${id}`,
        { content: commentContent },
        {
          withCredentials: true,
        },
      );
      setComments(response.post.comment);

      setCommentContent("");
    } catch (error) {
      console.error("Error commenting post:", error);
    }
  };

  // Handle AI Comment Generation
  const handleAiComment = async () => {
    setIsAiLoading(true);
    try {
      const response = await apiHelpers.get(`/post/suggest-comment/${id}`, {
        withCredentials: true,
      });

      if (response.success) {
        setCommentContent(response.suggestion);
        toast.success("AI comment generated! ");
      }
    } catch (error) {
      console.error("Error generating AI comment:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const [verifyLoading, setVerifyLoading] = useState(false);

  // Handle AI Comment Generation
  const handleVerifyPost = async () => {
    setVerifyLoading(true);
    try {
      const response = await apiHelpers.get(`/post/verify-content/${id}`, {
        withCredentials: true,
      });

      if (response.success) {
        toast.success(
          response.moderation.approved
            ? "Post content is appropriate"
            : `Post flagged: ${response.moderation.reason}`,
        );
      }
    } catch (error) {
      console.error("Error verifying post content:", error);
    } finally {
      setVerifyLoading(false);
    }
  };

  useEffect(() => {
    socket.on("likeUpdated", ({ postId, likes }) => {
      if (postId == id) {
        setLikes(likes);
      }
    });
    socket.on("commentAdded", ({ postId, comm }) => {
      if (postId == id) {
        setComments(comm);
      }
    });
    return () => {
      socket.off("likeUpdated");
      socket.off("commentAdded");
    };
  }, [id]);

  useEffect(() => {
    setLikes(like);
    setComments(comment);
  }, [like, comment]);

  return (
    <article className="glass-panel fade-in flex w-full flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex cursor-pointer gap-3"
          onClick={() => handleGetProfile(author.userName, navigate)}
        >
          <div className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-sky-500/20">
            <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-black">
              <img
                src={author.profileImage || emptyDp}
                alt={`${author.firstName} ${author.lastName}`}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            {onlineUsers.includes(author._id.toString()) && (
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-lg dark:border-slate-950" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 transition hover:text-sky-600 hover:underline dark:text-white">
              {author.firstName} {author.lastName}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {author.headline}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {moment(createdAt).fromNow()}
            </p>
          </div>
        </div>

        <PostActions
          handleVerifyPost={handleVerifyPost}
          verifyLoading={verifyLoading}
          userData={userData}
          author={author}
        />
      </div>

      <div
        className={`pl-1 text-sm leading-7 text-slate-700 dark:text-slate-200 ${
          readMore ? "" : "line-clamp-3"
        }`}
      >
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </div>
      {description.length > 200 && (
        <button
          className="ml-1 w-fit text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
          onClick={() => setReadMore((prev) => !prev)}
        >
          {readMore ? "Read less" : "Read more"}
        </button>
      )}

      {image && (
        <div className="flex h-[280px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-slate-100 dark:bg-slate-800/80 sm:h-[320px]">
          <img src={image} alt="Post visual" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <BiLike className="h-5 w-5 text-sky-500" />
          <span>{likes.length} Likes</span>
        </div>
        <div
          className="flex cursor-pointer items-center gap-2 transition hover:text-sky-600"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <span>{comments.length}</span>
          <span>Comments</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        <button
          className="control-ring flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-500/10"
          onClick={handleLikePost}
        >
          {likes.includes(userData._id) ? (
            <>
              <BiSolidLike className="h-5 w-5 text-sky-500" />
              <span>Liked</span>
            </>
          ) : (
            <>
              <BiLike className="h-5 w-5" />
              <span>Like</span>
            </>
          )}
        </button>

        <button
          className="control-ring flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-500/10"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <FaRegCommentDots className="h-5 w-5" />
          <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={handleAiComment}
          className={`control-ring rounded-full p-2 transition ${isAiLoading ? "animate-pulse text-purple-300" : "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900"}`}
          title="Generate AI Comment"
          disabled={isAiLoading}
        >
          <RiAiGenerate className="h-5 w-5" />
        </button>
      </div>

      {showComments && (
        <div className="mt-1 rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <form
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-950"
            onSubmit={handleCommentPost}
          >
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-grow bg-transparent text-sm text-slate-800 outline-none dark:text-white"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <button type="submit" className="control-ring rounded-full p-2 text-sky-600 transition hover:bg-sky-50 dark:hover:bg-slate-800">
              <LuSendHorizontal className="h-5 w-5 cursor-pointer" />
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-4">
            {comments.map((com, index) => (
              <div
                key={index}
                className="flex gap-3 border-b border-slate-200/70 pb-3 last:border-b-0 dark:border-slate-700"
              >
                <img
                  src={com.user.profileImage || emptyDp}
                  alt={`${com.user.firstName} ${com.user.lastName}`}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="cursor-pointer text-sm font-semibold text-slate-900 transition hover:text-sky-600 dark:text-white">
                      {com.user.firstName} {com.user.lastName}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {moment(com.createdAt).fromNow()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                    <ReactMarkdown>{com.content}</ReactMarkdown>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default Posts;
