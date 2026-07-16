import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPublicProfileAPI } from "../../../services/users.service";
import { useAsyncAction } from "../../../hooks/useAsyncAction";
import Footer from "../../../ui/common/Footer";
import { Icon } from "@/ui";
import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";

interface PublicTrip {
  _id: string;
  tripName: string;
  description?: string;
  startDate: string;
  endDate: string;
  destinationLocation?: { name: string };
  coverImageUrl?: string;
  category?: string;
  likeCount?: number;
}

export default function PublicProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [trips, setTrips] = useState<PublicTrip[]>([]);

  const { execute: loadProfile, isLoading: loading, error } = useAsyncAction({
    showToast: false,
    errorMessage: "Failed to load public profile"
  });

  useEffect(() => {
    if (!username) return;

    loadProfile(async () => {
      const data = await fetchPublicProfileAPI(username);
      setProfile(data.user);
      setTrips(data.trips || []);
    });
  }, [username, loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Loading public profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
            <Icon name="shieldAlert" size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Profile Unavailable</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            This profile is either private or does not exist. Users can manage their profile visibility settings from their settings panel.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/explore")}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Explore Public Itineraries
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        {/* Header action bar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <Icon name="arrowLeft" size={16} /> Go Back
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          {/* User Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-sm mb-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
            {profile.profilePicUrl ? (
              <img
                src={profile.profilePicUrl}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center text-4xl font-bold text-emerald-700">
                {profile.name?.[0] || profile.username[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                  {profile.name || profile.username}
                </h1>
                <p className="text-emerald-600 font-bold text-sm">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-gray-600 max-w-2xl leading-relaxed text-sm bg-gray-50 p-4 rounded-2xl border text-left">
                  {profile.bio}
                </p>
              )}

              <div className="flex justify-center sm:justify-start gap-8 text-sm">
                <div className="bg-gray-50 border px-5 py-2.5 rounded-xl text-center">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Public Trips</p>
                  <p className="font-black text-gray-900 text-xl mt-0.5">{profile.publicTripCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trips Grid section */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-left">Shared Itineraries</h2>
            {trips.length === 0 ? (
              <div className="text-center bg-white rounded-3xl border border-gray-200 py-16 px-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  🎒
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No shared trips yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm leading-normal">
                  This traveller hasn't published any public trip itineraries to their explore profile yet.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    onClick={() => navigate(`/explore/trips/${trip._id}`)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full text-left"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={trip.coverImageUrl || defaultTripCardCover}
                        alt={trip.tripName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow text-left">
                      <h3 className="font-black text-gray-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1 mb-2">
                        {trip.tripName}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {trip.description || "Take a peek at this custom travel itinerary stop schedule."}
                      </p>

                      <div className="mt-auto space-y-2.5 text-xs text-gray-600 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Icon name="location" size={14} className="text-emerald-500" />
                          <span className="font-bold line-clamp-1">{trip.destinationLocation?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="calendar" size={14} className="text-emerald-500" />
                          <span>
                            {new Date(trip.startDate).toLocaleDateString()} -{" "}
                            {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
