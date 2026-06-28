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
        className="control-ring rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <HiOutlineDotsHorizontal size={20} />
      </button>

      {showMenu && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={() => {
              handleVerifyPost();
              setShowMenu(false);
            }}
            disabled={verifyLoading}
            className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {verifyLoading ? "Verifying..." : "Verify Post with AI"}
          </button>
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
