"use client";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profile] = useState({
    name: "Albin John",
    email: "albin@example.com",
    // avatar: "https://ui-avatars.com/api/?name=Albin+John",
    bio: "Passionate about journaling and self-growth.",
    joined: "2024-06-01",
    moodStreak: 5,
    lastLogin: "2025-06-13 10:30",
  });
  const [journalsCount, setJournalsCount] = useState(0);

  useEffect(() => {
    // Fetch journals and set count
    const fetchJournals = async () => {
      const res = await fetch("/api/getJournals");
      const data = await res.json();
      setJournalsCount(data.journals ? data.journals.length : 0);
    };
    fetchJournals();
  }, []);

  return (
    <div className="w-full flex justify-center bg-gray-100 min-h-screen py-12">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-10">
        {/* Profile Header */}
        <div className="flex items-center border-b pb-8 mb-8">
          {/* <img
            src={profile.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-blue-200 mr-8"
          /> */}
          <div>
            <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
            <p className="text-gray-500 mb-1">{profile.email}</p>
            <p className="text-sm text-gray-400">Joined: {profile.joined}</p>
            <p className="text-base text-gray-700 mt-4">{profile.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="bg-blue-50 p-6 rounded-lg text-center shadow">
            <div className="text-3xl font-bold">{profile.moodStreak} 🔥</div>
            <div className="text-gray-600 text-lg mt-2">Mood Streak</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center shadow">
            <div className="text-3xl font-bold">{journalsCount}</div>
            <div className="text-gray-600 text-lg mt-2">Journals</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg text-center shadow">
            <div className="text-3xl font-bold">⭐</div>
            <div className="text-gray-600 text-lg mt-2">Achievements</div>
          </div>
        </div>

        {/* Account Details & Settings */}
        <div className="flex gap-12">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-3">Account Details</h2>
            <ul className="text-gray-700">
              <li className="mb-2">
                <span className="font-medium">Last Login:</span>{" "}
                {profile.lastLogin}
              </li>
              <li>
                <span className="font-medium">Email:</span> {profile.email}
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-3">Settings</h2>
            <button className="px-6 py-2 bg-blue-600 text-white rounded mr-3">
              Edit Profile
            </button>
            <button className="px-6 py-2 bg-gray-400 text-white rounded">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
