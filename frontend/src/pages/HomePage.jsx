import Navbar from "../components/Navbar";
import emptyDp from "../assets/emptyDp.jpg";
import { FiCamera, FiPlus } from "react-icons/fi";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import { FaPen } from "react-icons/fa6";
import EditProfile from "../components/EditProfile";
import { RxCross2 } from "react-icons/rx";
import { BsImage } from "react-icons/bs";
import { useState } from "react";
import { useRef } from "react";
import axios from "axios";
import Posts from "../components/Posts";
import { useEffect } from "react";
import ConnectionButton from "../components/ConnectionButton";
import { useNavigate } from "react-router-dom";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";
import { RiAiGenerate } from "react-icons/ri";
import toast from "react-hot-toast";
import apiHelpers from "../../api/apiHelper";
const HomePage = () => {
  const {
    userData,
    editProfile,
    setEditProfile,
    allPostsData,
    handleGetProfile,
  } = useContext(UserDataContext);
  const [frontendPostImage, setFrontendPostImage] = useState("");
  const [backendPostImage, setBackendPostImage] = useState("");
  const [description, setDescription] = useState("");
  const [showUploadPost, setShowUploadPost] = useState(false);
  const postImageRef = useRef();
  const [aiLoading, setIsAiLoading] = useState(false);

  const [posting, setPosting] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const navigate = useNavigate();

  function handleImage(e) {
    let file = e.target.files[0];
    setBackendPostImage(file);
    setFrontendPostImage(URL.createObjectURL(file));
  }

  async function handleUploadPost() {
    setPosting(true);
    try {
      let formData = new FormData();
      formData.append("description", description);
      if (backendPostImage) {
        formData.append("image", backendPostImage);
      }
      let result = await apiHelpers.post(`/post/create-post`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (result.success) {
        toast.success("Post created successfully!");
        setShowUploadPost(false);
        setDescription("");
        setFrontendPostImage("");
        setBackendPostImage("");
        setPosting(false);
      }
    } catch (error) {
      console.error("Error uploading post:", error);

      setPosting(false);
    }
  }

  const handleAIGeneratePost = async () => {
    try {
      if (!description.trim()) {
        toast.error("Please enter a post description to generate content.");
        return;
      }
      setIsAiLoading(true);
      let response = await apiHelpers.post(
        `/post/suggest-posts`,
        { aiPrompt: description },
        { withCredentials: true },
      );

      setDescription(response.data.description); // 👈 fill textarea
    } catch (error) {
      console.error("Error generating AI post:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // handle getting suggested users
  const handleGetSuggestedUsers = async () => {
    try {
      const result = await apiHelpers.get(`/user/suggest-users`, {
        withCredentials: true,
      });

      console.log("suggested users", result.suggestedUser);
      setSuggestedUsers(result.suggestedUser);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    }
  };
  useEffect(() => {
    handleGetSuggestedUsers();
  }, []);

  return (
    <div className="relative flex min-h-[100vh] w-full flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_35%),linear-gradient(135deg,_#f7f9ff_0%,_#eef4ff_45%,_#f8f5ff_100%)] px-4 pb-12 pt-[90px] transition-all duration-300 ease-in-out dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#030712_100%)] lg:flex-row lg:items-start lg:justify-center lg:px-6 xl:px-8">
      {editProfile && <EditProfile />}
      <Navbar />

      <section className="glass-panel relative w-full overflow-hidden lg:w-[25%]">
        <div className="relative h-[120px] bg-gradient-to-r from-sky-500 via-blue-500 to-violet-600 dark:from-sky-700 dark:via-blue-700 dark:to-violet-800">
          <img
            src={userData?.coverImage || "https://via.placeholder.com/600x200?text=Cover+Image"}
            alt="Cover"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
          <FiCamera
            className="absolute right-3 top-3 h-[28px] w-[28px] cursor-pointer rounded-full bg-white/90 p-1 text-slate-700 shadow transition hover:text-sky-600 dark:bg-slate-800/90 dark:text-slate-200"
            onClick={() => setEditProfile(true)}
            title="Edit Cover Image"
          />
        </div>

        <div className="relative px-5">
          <div className="absolute -top-[35px] left-5 h-[84px] w-[84px] rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-xl shadow-sky-500/20">
            <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-slate-900">
              <img
                src={userData?.profileImage || emptyDp}
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
          <div
            className="absolute left-[86px] top-[20px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-sky-500 text-xs text-white shadow hover:bg-sky-600"
            onClick={() => setEditProfile(true)}
            title="Change Profile Image"
          >
            <FiPlus />
          </div>
        </div>

        <div className="mt-12 px-5 pb-5">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {`${userData?.firstName} ${userData?.lastName}`}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {userData?.location || "Add your location"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {userData?.headline || "No headline provided"}
          </p>

          <button
            onClick={() => setEditProfile(true)}
            className="control-ring mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-sky-500/70 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
          >
            Edit Profile <FaPen className="text-sm" />
          </button>
        </div>
      </section>

      {showUploadPost && (
        <>
          <div className="fixed left-0 top-0 z-[100] h-full w-full bg-slate-950/70" />

          <div className="fixed left-1/2 top-[90px] z-[200] flex w-[92%] max-w-[560px] -translate-x-1/2 flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_35px_90px_-30px_rgba(15,23,42,0.55)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
            <div className="absolute right-3 top-3">
              <RxCross2
                className="h-6 w-6 cursor-pointer text-slate-700 transition hover:text-rose-500 dark:text-slate-200"
                onClick={() => setShowUploadPost(false)}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-[64px] w-[64px] rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg">
                <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-slate-900">
                  <img
                    src={userData?.profileImage || emptyDp}
                    alt="profile image"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{`${userData?.firstName} ${userData?.lastName}`}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Share something with your network</div>
              </div>
            </div>

            <textarea
              placeholder="What do you want to talk about..?"
              className={`min-h-[140px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-900/20 ${frontendPostImage ? "h-[180px]" : "h-[220px]"}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <input type="file" hidden ref={postImageRef} onChange={handleImage} />

            {frontendPostImage && (
              <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-slate-100 dark:bg-slate-800/80">
                <img src={frontendPostImage || ""} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <BsImage className="h-5 w-5 text-sky-500" />
                  <span>Add image</span>
                </div>
                <button
                  type="button"
                  onClick={() => postImageRef.current.click()}
                  className="control-ring rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Choose file
                </button>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleAIGeneratePost}
                  className={`control-ring rounded-full p-2 transition ${aiLoading ? "animate-pulse text-purple-300" : "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900"}`}
                  title="Generate AI Comment"
                  disabled={aiLoading}
                >
                  <RiAiGenerate className="h-5 w-5" />
                </button>
                <button
                  className="h-[44px] rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-5 font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={handleUploadPost}
                  disabled={posting}
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <section className="flex min-h-[200px] w-full flex-col gap-5 lg:w-[50%]">
        <div className="glass-panel flex items-center justify-center gap-3 px-4 py-4 sm:px-5">
          <div className="h-[60px] w-[60px] cursor-pointer rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white dark:bg-slate-900">
              <img
                src={userData?.profileImage || emptyDp}
                alt="profile image"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>

          <button
            className="control-ring flex h-[56px] w-[75%] items-center justify-start rounded-full border border-slate-200 bg-slate-50 px-5 text-left text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setShowUploadPost(true)}
          >
            Create a Post
          </button>
        </div>

        {/* Posts Loop */}
        {allPostsData.map((eachPost, index) => (
          <Posts
            key={index}
            id={eachPost._id}
            description={eachPost.description}
            author={eachPost.author}
            image={eachPost.image}
            like={eachPost.like}
            comment={eachPost.comment}
            createdAt={eachPost.createdAt}
          />
        ))}
      </section>

      <section className="glass-panel hidden min-h-[200px] w-full flex-col p-5 lg:flex lg:w-[25%]">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Suggested Users
          </h1>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
            Curated
          </span>
        </div>

        {suggestedUsers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {suggestedUsers.map((user) => (
              <div
                key={user._id}
                className="rounded-[22px] border border-slate-200/80 bg-white/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70"
              >
                <div
                  className="flex cursor-pointer items-start gap-3"
                  onClick={() => handleGetProfile(user.userName, navigate)}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-md">
                    <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-slate-900">
                      <img
                        src={user.profileImage || emptyDp}
                        alt="dp"
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      @{user.userName}
                    </p>

                    {user.headline && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {user.headline}
                      </p>
                    )}

                    {user.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.skills.slice(0, 2).map((skill, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-sky-50 px-2 py-[2px] text-[11px] font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {user.location && (
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        📍 {user.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <ConnectionButton userId={user._id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">No Suggested Users</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
