import Navbar from "../components/Navbar";
import emptyDp from "../assets/emptyDp.jpg";
import { FiCamera, FiPlus } from "react-icons/fi";

import { FaPen } from "react-icons/fa6";
import { UserDataContext } from "../context/UserContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import EditProfile from "../components/EditProfile";
import Posts from "../components/Posts";
import ConnectionButton from "../components/ConnectionButton";
import { FaPlus, FaGraduationCap, FaBriefcase, FaTools } from "react-icons/fa";

const Profile = () => {
  const { serverURL } = useAuthContext();
  const {
    userData,
    editProfile,
    setEditProfile,
    allPostsData,
    setAllPostsData,
    profileData,
    setProfileData,
  } = useContext(UserDataContext);
  console.log("from profile page userdata", userData);
  console.log("from profile page profiledata", profileData);
  const [profilePost, setProfilePost] = useState([]);

  useEffect(() => {
    setProfilePost(
      allPostsData.filter((post) => post.author._id == profileData._id)
    );
  }, [profileData]);
  return (
    <div className="w-full min-h-screen bg-[#f3f2ef] dark:bg-[#1a1a1a] transition-colors duration-300 flex flex-col items-center pt-[80px] pb-[40px]">
      <Navbar />
      {editProfile && <EditProfile />}

      <div className="w-full max-w-[900px] flex flex-col gap-6 px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Profile Card */}
        <div className="relative bg-white dark:bg-[#1c1c1c] rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all">
          {/* Cover Image */}
          <div className="relative w-full h-[150px] bg-gray-300 dark:bg-gray-700">
            <img
              src={profileData.coverImage || "coverimg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {profileData._id === userData._id && (
              <FiCamera
                className="absolute right-4 top-4 w-6 h-6 text-white bg-black/40 dark:bg-black/50 rounded-full p-1 cursor-pointer hover:scale-105 transition"
                onClick={() => setEditProfile(true)}
              />
            )}
          </div>

          {/* Profile Image */}
          <div className="absolute top-[100px] left-6 flex items-center">
            <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[2px] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                <img
                  src={profileData.profileImage || emptyDp}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {profileData._id === userData._id && (
              <div
                className="w-[22px] h-[22px] bg-[#17c1ff] ml-[-20px] mt-[40px] flex justify-center items-center rounded-full text-white text-xs font-bold cursor-pointer border-2 border-white dark:border-gray-900 shadow"
                onClick={() => setEditProfile(true)}
                title="Edit Profile Picture"
              >
                <FiPlus />
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="mt-[70px] px-6 pb-6 text-gray-800 dark:text-gray-100">
            <div className="text-xl font-semibold">
              {`${profileData.firstName} ${profileData.lastName}`}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {profileData.headline || ""}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {profileData.location}
            </div>
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {`${profileData.connection.length} Connections`}
            </div>

            {/* Edit/Profile Action */}
            {profileData._id === userData._id ? (
              <button
                onClick={() => setEditProfile(true)}
                className="px-4 py-2 rounded-full border border-[#2dc0ff] text-[#2dc0ff] hover:bg-blue-50 dark:hover:bg-[#083047] transition font-medium flex items-center gap-2"
              >
                <FaPen className="text-sm" />
                Edit Profile
              </button>
            ) : (
              <div className="mt-2">
                <ConnectionButton userId={profileData._id} />
              </div>
            )}
          </div>
        </div>

        {/* Post Count */}
        <div className="w-full bg-white dark:bg-[#1c1c1c] shadow-sm rounded-lg p-4 text-lg font-semibold text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700 mt-4">
          {`Posts (${profilePost.length})`}
        </div>

        {/* Post List */}
        {profilePost.map((eachPost, index) => (
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

        {/* Skills Section */}
        {profileData.skills.length > 0 && (
          <div className="w-full bg-white dark:bg-[#1c1c1c] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <FaTools className="text-blue-500" /> Skills
            </h2>
            <div className="flex flex-wrap gap-3 text-gray-700 dark:text-gray-200">
              {profileData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
              {profileData._id === userData._id && (
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-[#2dc0ff] text-[#2dc0ff] rounded-full hover:bg-blue-50 dark:hover:bg-[#083047] transition text-sm"
                  onClick={() => setEditProfile(true)}
                >
                  <FaPlus className="text-xs" /> Add Skills
                </button>
              )}
            </div>
          </div>
        )}

        {/* Education Section */}
        {profileData.education.length > 0 && (
          <div className="w-full bg-white dark:bg-[#1c1c1c] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <FaGraduationCap className="text-green-600" /> Education
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              {profileData.education.map((edu, idx) => (
                <div key={idx} className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">College:</span> {edu.college}
                  </div>
                  <div>
                    <span className="font-medium">Degree:</span> {edu.degree}
                  </div>
                  <div>
                    <span className="font-medium">Field:</span>{" "}
                    {edu.fieldOfStudy}
                  </div>
                </div>
              ))}
              {profileData._id === userData._id && (
                <button
                  className="mt-2 flex items-center gap-2 px-4 py-2 border border-[#2dc0ff] text-[#2dc0ff] rounded-full hover:bg-blue-50 dark:hover:bg-[#083047] transition text-sm"
                  onClick={() => setEditProfile(true)}
                >
                  <FaPlus className="text-xs" /> Add Education
                </button>
              )}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {profileData.experience.length > 0 && (
          <div className="w-full bg-white dark:bg-[#1c1c1c] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <FaBriefcase className="text-purple-600" /> Experience
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              {profileData.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Title:</span> {exp.title}
                  </div>
                  <div>
                    <span className="font-medium">Company:</span> {exp.company}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>{" "}
                    {exp.description}
                  </div>
                </div>
              ))}
              {profileData._id === userData._id && (
                <button
                  className="mt-2 flex items-center gap-2 px-4 py-2 border border-[#2dc0ff] text-[#2dc0ff] rounded-full hover:bg-blue-50 dark:hover:bg-[#083047] transition text-sm"
                  onClick={() => setEditProfile(true)}
                >
                  <FaPlus className="text-xs" /> Add Experience
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
