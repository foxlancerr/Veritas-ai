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
import { useAuthContext } from "../context/AuthContext";
import Posts from "../components/Posts";
import { useEffect } from "react";
import ConnectionButton from "../components/ConnectionButton";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const {
    userData,
    editProfile,
    setEditProfile,
    allPostsData,
    handleGetProfile,
  } = useContext(UserDataContext);
  const { serverURL } = useAuthContext();
  const [frontendPostImage, setFrontendPostImage] = useState("");
  const [backendPostImage, setBackendPostImage] = useState("");
  const [description, setDescription] = useState("");
  const [showUploadPost, setShowUploadPost] = useState(false);
  const postImageRef = useRef();

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
      let result = await axios.post(
        `${serverURL}/api/post/create-post`,
        formData,
        { withCredentials: true }
      );
      console.log(result);
      setPosting(false);
      setShowUploadPost(false);
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("Failed to upload post. Please try again.");
      setPosting(false);
    }
  }

  // handle getting suggested users
  const handleGetSuggestedUsers = async () => {
    try {
      const result = await axios.get(`${serverURL}/api/user/suggest-users`, {
        withCredentials: true,
      });

      console.log("suggested users", result.data.suggestedUser);
      setSuggestedUsers(result.data.suggestedUser);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      alert("Failed to fetch suggested users. Please try again.");
    }
  };
  useEffect(() => {
    handleGetSuggestedUsers();
  }, []);

  return (
    <div className="w-full min-h-[100vh] bg-[#f0efe7] dark:bg-gradient-to-br dark:from-[#121212] dark:to-black pt-[80px] pb-[50px] flex items-center lg:items-start justify-center gap-[20px] px-[20px] flex-col lg:flex-row relative transition-all duration-300 ease-in-out">
      {editProfile && <EditProfile />}
      <Navbar />

      <section className="relative w-full lg:w-[25%] bg-white dark:bg-[#1f1f1f] shadow-lg dark:shadow-xl rounded-xl overflow-hidden transition-colors duration-300">
        {/* Cover Image + Camera Icon */}
        <div className="relative h-[120px] bg-gray-300 dark:bg-gray-700">
          <img
            src={
              userData.coverImage ||
              "https://via.placeholder.com/600x200?text=Cover+Image"
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <FiCamera
            className="absolute top-3 right-3 w-[28px] h-[28px] p-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow hover:text-blue-500 cursor-pointer transition"
            onClick={() => setEditProfile(true)}
            title="Edit Cover Image"
          />
        </div>

        {/* Profile Picture + Plus Icon */}
        <div className="relative px-5">
          <div className="absolute -top-[35px] left-5 w-[80px] h-[80px] rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
              <img
                src={userData.profileImage || emptyDp}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div
            className="absolute top-[20px] left-[80px] w-[20px] h-[20px] bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer shadow hover:bg-blue-600 transition"
            onClick={() => setEditProfile(true)}
            title="Change Profile Image"
          >
            <FiPlus />
          </div>
        </div>

        {/* User Info */}
        <div className="mt-12 px-5 pb-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {`${userData.firstName} ${userData.lastName}`}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userData.location}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userData.headline || "No headline provided"}
          </p>

          <button
            onClick={() => setEditProfile(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 border border-blue-400 text-blue-500 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-[#223344] transition"
          >
            Edit Profile <FaPen className="text-sm" />
          </button>
        </div>
      </section>

      {/* Create Post Modal Dark Background */}
      {showUploadPost && (
        <div className="w-full h-full bg-black fixed top-0 left-0 opacity-60 z-[100]" />
      )}

      {/* Create Post Modal */}
      {showUploadPost && (
        <div className="w-[90%] max-w-[500px] h-[550px] bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-lg dark:shadow-xl rounded-lg fixed z-[200] p-5 top-[100px] flex flex-col gap-5 transition-colors duration-300">
          {/* Close Button */}
          <div className="absolute top-2 right-2">
            <RxCross2
              className="w-6 h-6 text-gray-800 dark:text-gray-200 cursor-pointer hover:text-red-500 transition"
              onClick={() => setShowUploadPost(false)}
            />
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                <img
                  src={userData.profileImage || emptyDp}
                  alt="profile image"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div className="font-semibold text-[18px]">{`${userData.firstName} ${userData.lastName}`}</div>
          </div>

          {/* Textarea */}
          <textarea
            placeholder="What do you want to talk about..?"
            className={`w-full ${
              frontendPostImage ? "h-[200px]" : "h-[550px]"
            } outline-none border-none p-3 resize-none text-lg bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <input type="file" hidden ref={postImageRef} onChange={handleImage} />

          {/* Uploaded Image */}
          <div className="w-full h-[300px] overflow-hidden flex justify-center items-center rounded-lg">
            <img
              src={frontendPostImage || ""}
              alt=""
              className="h-full rounded-lg"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col mt-auto w-full">
            <div className="p-3 flex items-center border-b border-gray-300 dark:border-gray-600">
              <BsImage
                className="w-6 h-6 text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => postImageRef.current.click()}
              />
            </div>

            <div className="flex justify-end items-center">
              <button
                className="w-[100px] h-[45px] rounded-full bg-[#24b2ff] hover:bg-[#1ca2e5] mt-4 text-white font-semibold transition"
                onClick={handleUploadPost}
                disabled={posting}
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ############# Post Show Section ############# */}
      <section className="w-full lg:w-[50%] min-h-[200px]  flex flex-col gap-[20px]">
        {/* Create Post Box */}
        <div className="w-full h-[120px] bg-white dark:bg-[#2a2a2a] shadow-lg rounded-lg flex items-center justify-center gap-[10px]">
          <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg cursor-pointer">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
              <img
                src={userData.profileImage || emptyDp}
                alt="profile image"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          <button
            className="w-[75%] h-[60px] border-2 border-gray-400 dark:border-gray-600 rounded-full flex items-center justify-start px-[20px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-gray-100"
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

      {/* ############# Suggested Users Section ############# */}
      <section className="w-full lg:w-[25%] min-h-[200px] bg-white dark:bg-[#2a2a2a] shadow-lg hidden lg:flex flex-col p-5 rounded-xl">
        <h1 className="text-xl text-gray-700 dark:text-gray-100 font-semibold mb-4">
          Suggested Users
        </h1>

        {suggestedUsers.length > 0 ? (
          <div className="flex flex-col gap-4">
            {suggestedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                {/* Profile Image */}
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-md cursor-pointer"
                  onClick={() => handleGetProfile(user.userName, navigate)}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#1a1a1a]">
                    <img
                      src={user.profileImage || emptyDp}
                      alt="dp"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2
                    className="text-sm font-semibold text-gray-800 dark:text-gray-100 cursor-pointer"
                    onClick={() => handleGetProfile(user.userName, navigate)}
                  >
                    {user.firstName} {user.lastName}
                  </h2>

                  <p
                    className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
                    onClick={() => handleGetProfile(user.userName, navigate)}
                  >
                    @{user.userName}
                  </p>

                  {user.headline && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {user.headline}
                    </p>
                  )}

                  {user.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.skills.slice(0, 2).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-[2px] rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {user.location && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                      📍 {user.location}
                    </p>
                  )}

                  {/* Connection Button */}
                  <div className="mt-2">
                    <ConnectionButton userId={user._id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No Suggested Users
          </p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
