import React from "react";
import { useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import ConnectionButton from "./ConnectionButton";

function PostActions({ handleVerifyPost, verifyLoading, userData, author }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="p-2 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
      >
        <HiOutlineDotsHorizontal size={20} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-900 border-1 border-slate-200 dark:border-slate-700 rounded-none shadow-xl backdrop-blur-sm overflow-hidden z-50">
          <button
            onClick={() => {
              handleVerifyPost();
              setShowMenu(false);
            }}
            disabled={verifyLoading}
            className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {verifyLoading ? "Verifying..." : "Verify Post with AI"}
          </button>
          {/* Connection Button */}
          {userData._id !== author._id && (
            <div className="px-4 pb-3 pt-1">
              <ConnectionButton userId={author._id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PostActions;
