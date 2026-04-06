import { useContext, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { UserDataContext } from "../context/UserContext";
import emptyDp from "../assets/emptyDp.jpg";
import { FiCamera, FiPlus } from "react-icons/fi";
import axios from "axios";

import {
  FaUser,
  FaUserTag,
  FaHashtag,
  FaBriefcase,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { FaGraduationCap } from "react-icons/fa";
import { MdWorkOutline } from "react-icons/md";
import { FaVenusMars, FaTools } from "react-icons/fa";
import { VITE_BACKEND_API_URL } from "../../api/url_helper";
import apiHelpers from "../../api/apiHelper";

const EditProfile = () => {
  const [saving, setSaving] = useState(false);
  const { userData, setUserData, setEditProfile } = useContext(UserDataContext);
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [userName, setUserName] = useState(userData?.userName || "");
  const [headline, setHeadline] = useState(userData?.headline || "");
  const [gender, setGender] = useState(userData?.gender || "");
  const [location, setLocation] = useState(userData?.location || "");
  //   for skills
  const [skills, setSkills] = useState(userData?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  //   for education
  const [education, setEducation] = useState(userData?.education || []);
  const [newEducation, setNewEducation] = useState({
    college: "",
    degree: "",
    fieldOfStudy: "",
  });
  //   for experience
  const [experience, setExperience] = useState(userData?.experience || []);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    description: "",
  });

  // profile and cover image
  const profileImage = useRef();
  const coverImage = useRef();
  const [frontendProfileImage, SetFrontendProfileImage] = useState(
    userData.profileImage || emptyDp,
  );
  const [backendProfileImage, SetBackendProfileImage] = useState(null);
  const [frontendCoverImage, SetFrontendCoverImage] = useState(
    userData.coverImage || null,
  );
  const [backendCoverImage, SetBackendCoverImage] = useState(null);
  //   function for add a skill
  function addSkill() {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
    }
    setNewSkill("");
  }

  //   function for removing skill
  function removeSkill(skill) {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    }
  }
  //   function for add education
  function addEducation() {
    if (
      newEducation.college &&
      newEducation.degree &&
      newEducation.fieldOfStudy
    ) {
      setEducation([...education, newEducation]);
    }
    setNewEducation({
      college: "",
      degree: "",
      fieldOfStudy: "",
    });
  }

  //   function for removing Education
  function removeEducation(edu) {
    if (education.includes(edu)) {
      setEducation(education.filter((e) => e !== edu));
    }
  }
  //   function for add experience
  function addExperience() {
    if (
      newExperience.title &&
      newExperience.company &&
      newExperience.description
    ) {
      setExperience([...experience, newExperience]);
    }
    setNewExperience({
      title: "",
      company: "",
      description: "",
    });
  }

  //   function for removing experience
  function removeExperience(exp) {
    if (experience.includes(exp)) {
      setExperience(experience.filter((ex) => ex !== exp));
    }
  }

  // function for profile image
  function handleProfileImage(e) {
    let file = e.target.files[0];
    SetBackendProfileImage(file);
    SetFrontendProfileImage(URL.createObjectURL(file));
  }
  // function for cover image
  function handleCoverImage(e) {
    let file = e.target.files[0];
    SetBackendCoverImage(file);
    SetFrontendCoverImage(URL.createObjectURL(file));
  }

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      let formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("userName", userName);
      formData.append("headline", headline);
      formData.append("location", location);
      formData.append("gender", gender);
      formData.append("skills", JSON.stringify(skills));
      formData.append("education", JSON.stringify(education));
      formData.append("experience", JSON.stringify(experience));
      if (backendProfileImage) {
        formData.append("profileImage", backendProfileImage);
      }
      if (backendCoverImage) {
        formData.append("coverImage", backendCoverImage);
      }
      const result = await apiHelpers.put(`/user/update-profile`, formData, {
        withCredentials: true,
      });

      setUserData(result);
      setSaving(false);
      setEditProfile(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };
  return (
    <div className="w-full h-screen fixed top-0 left-0 z-[100] flex justify-center items-center">
      {/* Overlay */}
      <div className="w-full h-full bg-black opacity-50 absolute top-0 left-0 z-[100]" />

      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={profileImage}
        onChange={handleProfileImage}
      />
      <input
        type="file"
        accept="image/*"
        hidden
        ref={coverImage}
        onChange={handleCoverImage}
      />

      {/* Modal Content */}
      <div className="w-[90%] max-w-[500px] h-[600px] dark:bg-[#1f1f1f] bg-white rounded-xl shadow-2xl z-[200] relative overflow-auto p-5">
        {/* Close Button */}
        <button
          onClick={() => setEditProfile(false)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <RxCross2 className="w-6 h-6 text-gray-800 dark:text-gray-300" />
        </button>

        {/* Cover Image */}
        <div className="relative h-[120px] bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden mt-8">
          <img
            src={
              frontendCoverImage ||
              "https://via.placeholder.com/600x200?text=Cover+Image"
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => coverImage.current.click()}
            className="absolute top-3 right-3 w-[28px] h-[28px] p-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow hover:text-blue-500 cursor-pointer transition"
            title="Edit Cover Image"
          >
            <FiCamera className="w-full h-full" />
          </button>
        </div>

        {/* Profile Picture + Plus Icon */}
        <div className="relative px-5">
          {/* Gradient Border Wrapper */}
          <div className="absolute -top-[35px] left-5 w-[80px] h-[80px] rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
              <img
                src={frontendProfileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* Plus Icon */}
          <div
            onClick={() => profileImage.current.click()}
            className="absolute top-[20px] left-[80px] w-[20px] h-[20px] bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer shadow hover:bg-blue-600 transition"
            title="Change Profile Image"
          >
            <FiPlus />
          </div>
        </div>

        <form className="mt-24 flex flex-col gap-6 px-2">
          {/* First Name */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FaUser className="text-blue-500" />
              First Name
            </label>
            <input
              type="text"
              placeholder="Enter your first name"
              className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FaUserTag className="text-blue-500" />
              Last Name
            </label>
            <input
              type="text"
              placeholder="Enter your last name"
              className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FaHashtag className="text-blue-500" />
              Username
            </label>
            <input
              type="text"
              placeholder="Unique username"
              className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FaBriefcase className="text-blue-500" />
              Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer at ABC"
              className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FaMapMarkerAlt className="text-blue-500" />
              Location
            </label>
            <input
              type="text"
              placeholder="City, Country"
              className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FaVenusMars className="text-blue-500" />
              Gender
            </label>
            <select
              className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Skills Section */}
          <div className="w-full flex flex-col gap-4 p-4 mt-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
              <FaTools className="text-blue-500" />
              Skills
            </h2>

            {/* Skill List */}
            <div className="flex flex-col gap-2">
              {skills.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No skills added yet.
                </p>
              )}

              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 rounded-md"
                >
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {skill}
                  </span>
                  <RxCross2
                    onClick={() => removeSkill(skill)}
                    className="w-5 h-5 text-gray-700 dark:text-white hover:text-red-500 cursor-pointer transition"
                  />
                </div>
              ))}
            </div>

            {/* Add Skill */}
            <div className="flex flex-col gap-3 mt-2">
              <input
                type="text"
                placeholder="e.g. React, Tailwind CSS"
                className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button
                type="button"
                onClick={addSkill}
                className="w-full text-white bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Education Section */}
          <div className="w-full flex flex-col gap-4 p-4 mt-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
              <FaGraduationCap className="text-blue-500" />
              Education
            </h2>

            {/* Existing Education Entries */}
            <div className="flex flex-col gap-3">
              {education.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No education added yet.
                </p>
              )}

              {education.map((edu, index) => (
                <div
                  key={index}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md relative"
                >
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    <strong>College:</strong> {edu.college}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    <strong>Degree:</strong> {edu.degree}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    <strong>Field:</strong> {edu.fieldOfStudy}
                  </div>
                  <RxCross2
                    className="absolute top-2 right-2 w-5 h-5 text-gray-600 dark:text-white hover:text-red-500 cursor-pointer"
                    onClick={() => removeEducation(edu)}
                  />
                </div>
              ))}
            </div>

            {/* Add New Education Inputs */}
            <div className="flex flex-col gap-3 mt-4">
              <input
                type="text"
                placeholder="College / University"
                className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={newEducation.college}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, college: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Degree (e.g., BS, MS)"
                className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={newEducation.degree}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, degree: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Field of Study (e.g., Computer Science)"
                className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={newEducation.fieldOfStudy}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    fieldOfStudy: e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={addEducation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Education
              </button>
            </div>
          </div>

          {/* Experience Section */}
          <div className="w-full flex flex-col gap-4 p-4 mt-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
              <MdWorkOutline className="text-blue-500" />
              Experience
            </h2>

            {/* Existing Experience Entries */}
            <div className="flex flex-col gap-3">
              {experience.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No experience added yet.
                </p>
              )}

              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md relative"
                >
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    <strong>Title:</strong> {exp.title}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    <strong>Company:</strong> {exp.company}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    <strong>Description:</strong> {exp.description}
                  </div>
                  <RxCross2
                    className="absolute top-2 right-2 w-5 h-5 text-gray-600 dark:text-white hover:text-red-500 cursor-pointer"
                    onClick={() => removeExperience(exp)}
                  />
                </div>
              ))}
            </div>

            {/* Add New Experience Inputs */}
            <div className="flex flex-col gap-3 mt-4">
              <input
                type="text"
                placeholder="Job Title (e.g., Frontend Developer)"
                className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={newExperience.title}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Company (e.g., Google)"
                className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    company: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Brief Description (e.g., Built scalable UI with React)"
                className="w-full h-12 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={newExperience.description}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    description: e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={addExperience}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Experience
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            disabled={saving}
            onClick={handleUpdateProfile}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition text-white text-base font-medium rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
