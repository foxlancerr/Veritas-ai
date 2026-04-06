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

const Posts = ({
  id,
  description,
  author,
  image,
  like,
  comment,
  createdAt,
}) => {
  const { userData, setUserData, getAllPosts, handleGetProfile } =
    useContext(UserDataContext);
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
    <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md p-6 flex flex-col gap-5 border border-gray-200 dark:border-gray-700 ">
      {/* Author Info */}
      <div className="flex justify-between items-start">
        <div
          className="flex gap-4 cursor-pointer"
          onClick={() => handleGetProfile(author.userName, navigate)}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-black">
              <img
                src={author.profileImage || emptyDp}
                alt={`${author.firstName} ${author.lastName}`}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold hover:underline hover:text-blue-600 dark:text-white transition">
              {author.firstName} {author.lastName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {author.headline}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {moment(createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Connection Button */}
        {userData._id !== author._id && (
          <ConnectionButton userId={author._id} />
        )}
      </div>

      {/* Description */}
      <div
        className={`pl-4 text-sm text-gray-800 dark:text-gray-200 ${
          readMore ? "" : "line-clamp-3"
        }`}
      >
        <div className="prose dark:prose-invert">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </div>
      {description.length > 200 && (
        <button
          className="text-blue-500 hover:underline text-sm font-medium w-fit ml-4"
          onClick={() => setReadMore((prev) => !prev)}
        >
          {readMore ? "Read less" : "Read more"}
        </button>
      )}

      {/* Image */}
      {image && (
        <div className="w-full h-[300px] rounded-lg overflow-hidden flex justify-center">
          <img
            src={image}
            alt="Post visual"
            className="h-full object-cover rounded-lg"
          />
        </div>
      )}

      {/* Likes & Comments Count */}
      <div className="w-full flex justify-between items-center border-b dark:border-gray-700 pb-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <BiLike className="text-blue-500 w-5 h-5" />
          <span>{likes.length} Likes</span>
        </div>
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-500"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <span>{comments.length}</span>
          <span>Comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
        <button
          className="flex items-center gap-1 hover:text-blue-500 transition"
          onClick={handleLikePost}
        >
          {likes.includes(userData._id) ? (
            <>
              <BiSolidLike className="w-5 h-5 text-blue-500" />
              <span>Liked</span>
            </>
          ) : (
            <>
              <BiLike className="w-5 h-5" />
              <span>Like</span>
            </>
          )}
        </button>

        <button
          className="flex items-center gap-1 hover:text-blue-500 transition"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <FaRegCommentDots className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button
          type="button" // Important: type="button" so it doesn't submit the form
          onClick={handleAiComment}
          className={`p-1 rounded-full transition ${isAiLoading ? "animate-pulse text-purple-300" : "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900"}`}
          title="Generate AI Comment"
          disabled={isAiLoading}
        >
          <RiAiGenerate className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4">
          {/* Comment Form */}
          <form
            className="flex items-center gap-2 border dark:border-gray-700 rounded-md px-3 py-2"
            onSubmit={handleCommentPost}
          >
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-grow outline-none text-sm dark:bg-transparent dark:text-white"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <button type="submit">
              <LuSendHorizontal className="text-blue-500 w-5 h-5 cursor-pointer" />
            </button>
          </form>

          {/* Comment List */}
          <div className="flex flex-col gap-4 mt-4">
            {comments.map((com, index) => (
              <div
                key={index}
                className="flex gap-3 border-b dark:border-gray-700 pb-3"
              >
                <img
                  src={com.user.profileImage || emptyDp}
                  alt={`${com.user.firstName} ${com.user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm hover:text-blue-600 transition cursor-pointer dark:text-white">
                      {com.user.firstName} {com.user.lastName}
                    </h4>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {moment(com.createdAt).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-gray-800 dark:text-gray-200">
                    <ReactMarkdown>{com.content}</ReactMarkdown>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
