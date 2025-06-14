"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Client, Account, Databases, ID, Query } from "appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('684aa8f1001ab90bbfd9'); // Your project ID

const account = new Account(client);
const databases = new Databases(client);

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [journalsCount, setJournalsCount] = useState(0);
  const [recentMoods, setRecentMoods] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user from Appwrite Auth
        const currentUser = await account.get();
        
        // Create profile object from Appwrite Auth user data
        let userProfile = {
          id: currentUser.$id,
          name: currentUser.name,
          email: currentUser.email,
          // Use preferences to store additional user data
          bio: currentUser.prefs?.bio || "",
          location: currentUser.prefs?.location || "",
          occupation: currentUser.prefs?.occupation || "",
          avatar: currentUser.prefs?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=4f46e5&color=fff&size=200`,
          joined: new Date(currentUser.$createdAt).toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        setProfile(userProfile);

        try {
          // Fetch journals count
          const journalsResponse = await databases.listDocuments(
            "lumanest",  // Database ID
            "journals",  // Collection ID
            [Query.equal("userId", currentUser.$id)]
          );
          setJournalsCount(journalsResponse.total);
          
          // Fetch recent moods (if moods collection exists)
          try {
            const moodsResponse = await databases.listDocuments(
              "lumanest",  // Database ID
              "moods",     // Collection ID
              [
                Query.equal("userId", currentUser.$id),
                Query.orderDesc("$createdAt")
              ],
              5 // Limit to 5 most recent
            );
            
            const formattedMoods = moodsResponse.documents.map(mood => ({
              id: mood.$id,
              date: new Date(mood.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              mood: mood.type,
              color: getMoodColor(mood.type)
            }));
            
            setRecentMoods(formattedMoods);
          } catch (error) {
            console.log("No moods collection or other error:", error);
          }
        } catch (error) {
          console.log("Error fetching journals:", error);
        }

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        
        // If user is not logged in, redirect to login
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Update name in Appwrite Auth
      await account.updateName(profile.name);
      
      // Store additional profile information in user preferences
      await account.updatePrefs({
        bio: profile.bio || "",
        location: profile.location || "",
        occupation: profile.occupation || "",
        avatar: profile.avatar
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      router.push('/auth/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Helper function to get mood color class
  const getMoodColor = (moodType) => {
    const moodColors = {
      happy: "bg-green-500",
      calm: "bg-blue-400",
      sad: "bg-purple-400",
      anxious: "bg-yellow-500",
      angry: "bg-red-400"
    };
    
    return moodColors[moodType?.toLowerCase()] || "bg-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <button 
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-gradient-to-b from-indigo-50 to-white min-h-screen py-8">
      <div className="w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-center">
                <div className="relative mb-4 inline-block">
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-white mx-auto object-cover"
                  />
                  {!isEditing && (
                    <button 
                      onClick={handleEditProfile}
                      className="absolute bottom-0 right-0 bg-white p-1 rounded-full text-indigo-600 shadow-md"
                    >
                      ✏️
                    </button>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <p className="text-indigo-100">{profile.occupation || "Member"}</p>
              </div>
              
              {/* Profile Details */}
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={profile.email}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        rows={3}
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={profile.location || ""}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={profile.occupation || ""}
                        onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                        placeholder="Your profession"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button 
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {profile.bio ? (
                      <p className="text-gray-600 mb-6 text-sm italic">"{profile.bio}"</p>
                    ) : (
                      <p className="text-gray-400 mb-6 text-sm italic">No bio provided</p>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <span className="mr-3 text-indigo-500">✉️</span>
                        <span>{profile.email}</span>
                      </div>
                      {profile.location && (
                        <div className="flex items-center text-gray-700">
                          <span className="mr-3 text-indigo-500">📍</span>
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-700">
                        <span className="mr-3 text-indigo-500">📅</span>
                        <span>Joined: {new Date(profile.joined).toLocaleDateString('en-US', {
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        onClick={handleEditProfile}
                        className="w-full flex items-center justify-center px-4 py-2 border border-indigo-500 text-indigo-600 rounded-md hover:bg-indigo-50"
                      >
                        <span className="mr-2">✏️</span>
                        Edit Profile
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-2">
                  <span className="text-indigo-600 mr-2">📝</span>
                  <h2 className="text-lg font-semibold text-gray-800">Your Journals</h2>
                </div>
                <div className="flex items-center">
                  <span className="text-4xl font-bold text-indigo-700">{journalsCount}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">entries created</p>
                <div className="mt-4">
                  <button 
                    onClick={() => router.push("/journals")} 
                    className="text-indigo-600 text-sm hover:underline flex items-center"
                  >
                    View all journals
                    <span className="ml-1">→</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-2">
                  <span className="text-indigo-600 mr-2">📊</span>
                  <h2 className="text-lg font-semibold text-gray-800">Activity</h2>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Continue your wellness journey by writing new journal entries and tracking your mood regularly.
                </p>
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => router.push("/journals/new")} 
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
                  >
                    New Journal
                  </button>
                  <button 
                    onClick={() => router.push("/mood-tracker")} 
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
                  >
                    Track Mood
                  </button>
                </div>
              </div>
            </div>
            
            {/* Recent Moods */}
            {recentMoods.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Moods</h2>
                
                <div className="grid grid-cols-5 gap-2">
                  {recentMoods.map((mood, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center shadow-sm`}>
                        <span className="text-white text-lg">
                          {mood.mood === 'happy' ? '😊' : 
                           mood.mood === 'calm' ? '😌' : 
                           mood.mood === 'sad' ? '😔' : 
                           mood.mood === 'anxious' ? '😰' : 
                           mood.mood === 'angry' ? '😠' : '😐'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{mood.date}</span>
                      <span className="text-xs font-medium">{mood.mood}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-right">
                  <button 
                    onClick={() => router.push("/mood-tracker")} 
                    className="text-indigo-600 text-sm hover:underline flex items-center justify-end ml-auto"
                  >
                    View full history
                    <span className="ml-1">→</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Account Actions */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push("/account/settings")} 
                  className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span className="mr-2">⚙️</span>
                  Account Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <span className="mr-2">🚪</span>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}