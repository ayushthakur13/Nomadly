import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { extractApiError } from "@/utils/errorHandling";
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  useLogout,
} from "@/features/auth";
import {
  fetchCurrentUserAPI,
  fetchPublicProfileAPI,
  updateProfileAPI,
  updateUsernameAPI,
  uploadAvatarAPI,
  deleteAvatarAPI,
  updatePasswordAPI
} from "@/services/users.service";
import { fetchTripsAPI } from "@/services/trips.service";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { TOAST_MESSAGES } from "@/constants/toastMessages";
import { ConfirmationModal } from "@/ui/common";
import { AvatarManager } from "../components";

interface ProfileFormData {
  username: string;
  name: string;
  bio: string;
  isPublic: boolean;
}

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { performLogout } = useLogout();
  const { user, loading } = useSelector((state: any) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [publicTripCount, setPublicTripCount] = useState<number>(0);
  const [isVisibilityWarningOpen, setIsVisibilityWarningOpen] = useState<boolean>(false);
  const [isSubmittingVisibility, setIsSubmittingVisibility] = useState<boolean>(false);

  const { execute: fetchProfile, isLoading: profileLoading } = useAsyncAction({
    showToast: false
  });
  const { execute: updateAvatar, isLoading: uploadingAvatar } = useAsyncAction({
    onSuccess: () => {
      setAvatarPreview(null);
      toast.success(TOAST_MESSAGES.PROFILE.AVATAR_UPDATE_SUCCESS);
    },
    errorMessage: "Failed to upload avatar"
  });
  const { execute: deleteAvatar, isLoading: deletingAvatar } = useAsyncAction({
    onSuccess: () => toast.success(TOAST_MESSAGES.PROFILE.AVATAR_REMOVE_SUCCESS),
    errorMessage: "Failed to remove avatar"
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormData>();

  useEffect(() => {
    fetchProfile(async () => {
      const response = await fetchCurrentUserAPI();
      const profile = response.data.user;
      reset({
        username: profile.username ?? "",
        name: profile.name ?? "",
        bio: profile.bio ?? "",
        isPublic: profile.isPublic ?? false,
      });

      if (profile.username && profile.isPublic) {
        try {
          const pubProfile = await fetchPublicProfileAPI(profile.username);
          setPublicTripCount(pubProfile.user.publicTripCount || 0);
        } catch {
          const userTrips = await fetchTripsAPI().catch(() => []);
          if (Array.isArray(userTrips)) {
            const count = userTrips.filter((t: any) => t.isPublic).length;
            setPublicTripCount(count);
          }
        }
      }
    });
  }, [reset, fetchProfile]);

  const isPublicWatch = watch("isPublic");

  const handleTogglePublic = (checked: boolean) => {
    if (!checked && (user?.isPublic ?? false) && publicTripCount > 0) {
      setIsVisibilityWarningOpen(true);
    } else {
      setValue("isPublic", checked, { shouldDirty: true });
    }
  };

  const handleConfirmPrivate = async () => {
    setIsSubmittingVisibility(true);
    dispatch(updateProfileStart());
    try {
      const response = await updateProfileAPI({ isPublic: false });
      const latestUser = response.data.user;
      dispatch(updateProfileSuccess({ user: latestUser }));
      toast.success("Profile set to private. All public trips unpublished.");
      setPublicTripCount(0);
      reset({
        username: latestUser.username || "",
        name: latestUser.name || "",
        bio: latestUser.bio || "",
        isPublic: false,
      });
      setIsVisibilityWarningOpen(false);
    } catch (error: any) {
      const message = extractApiError(error, "Failed to update profile visibility");
      toast.error(message);
      dispatch(updateProfileFailure(message));
    } finally {
      setIsSubmittingVisibility(false);
    }
  };

  const handleCancelPrivateModal = () => {
    setIsVisibilityWarningOpen(false);
    setValue("isPublic", true, { shouldDirty: false });
  };

  const onSubmit = async (data: ProfileFormData) => {
    const updates: any = {};
    if (data.name.trim() !== (user?.name || ""))
      updates.name = data.name.trim();
    if ((data.bio || "").trim() !== (user?.bio || ""))
      updates.bio = (data.bio || "").trim();
    if (data.isPublic !== (user?.isPublic || false))
      updates.isPublic = data.isPublic;

    const usernameChanged =
      (data.username || "").trim() !== (user?.username || "");

    if (!usernameChanged && Object.keys(updates).length === 0) {
      toast.error(TOAST_MESSAGES.GENERIC.ERROR);
      dispatch(updateProfileFailure("No changes"));
      return;
    }

    dispatch(updateProfileStart());

    let latestUser = user;
    let anySuccess = false;

    if (Object.keys(updates).length > 0) {
      try {
        const response = await updateProfileAPI(updates);
        latestUser = response.data.user;
        dispatch(updateProfileSuccess({ user: response.data.user }));
        anySuccess = true;
        toast.success(TOAST_MESSAGES.PROFILE.UPDATE_SUCCESS);
      } catch (error: any) {
        const message = extractApiError(error, "Failed to update profile");
        toast.error(message);
      }
    }

    if (usernameChanged) {
      const newUsername = (data.username || "").trim();
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
        toast.error(
          "Username must be 3-20 chars (letters, numbers, underscore)"
        );
      } else {
        try {
          const response = await updateUsernameAPI(newUsername);
          latestUser = response.data.user;
          dispatch(updateProfileSuccess({ user: response.data.user }));
          anySuccess = true;
          toast.success(TOAST_MESSAGES.PROFILE.USERNAME_UPDATE_SUCCESS);
        } catch (error: any) {
          const msg =
            error?.response?.status === 409
              ? "Username already taken"
              : extractApiError(error, "Failed to update username");
          toast.error(msg);
        }
      }
    }

    if (anySuccess && latestUser) {
      reset({
        username: latestUser.username || "",
        name: latestUser.name || "",
        bio: latestUser.bio || "",
        isPublic: latestUser.isPublic || false,
      });
    } else if (!anySuccess) {
      dispatch(updateProfileFailure("Failed to save changes"));
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(TOAST_MESSAGES.IMAGE.INVALID_TYPE);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(TOAST_MESSAGES.IMAGE.TOO_LARGE(5));
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    await updateAvatar(async () => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await uploadAvatarAPI(formData);
      dispatch(updateProfileSuccess({ user: response.data.user }));
      URL.revokeObjectURL(preview);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteAvatar = async () => {
    if (!user?.profilePicUrl) return;

    await deleteAvatar(async () => {
      const response = await deleteAvatarAPI();
      dispatch(updateProfileSuccess({ user: response.data.user }));
    });
  };

  // Change password section
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const { execute: changePassword, isLoading: pwdLoading } = useAsyncAction({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(TOAST_MESSAGES.PROFILE.PASSWORD_UPDATE_SUCCESS);
    },
    errorMessage: "Failed to update password"
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCurrentUserAPI();
        setHasPassword(Boolean(data?.data?.user?.hasPassword));
      } catch {}
    })();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    await changePassword(async () => {
      const payload: any = { newPassword };
      if (hasPassword) payload.currentPassword = currentPassword;
      await updatePasswordAPI(payload);
    });
  };

  const handleCancel = () => {
    reset({
      username: user?.username || "",
      name: user?.name || "",
      bio: user?.bio || "",
      isPublic: user?.isPublic || false,
    });
  };

  const bioValue = watch("bio") || "";

  const handleLogout = async () => {
    await performLogout();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 py-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Page Header */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Profile Identity
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Customize your public traveler persona, avatar, and visibility settings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-8 overflow-x-hidden">
                {/* Left: Avatar Section */}
                <div className="lg:w-1/3">
                  <AvatarManager
                    user={user}
                    avatarPreview={avatarPreview}
                    uploading={uploadingAvatar}
                    fileInputRef={fileInputRef}
                    onPickFile={() => fileInputRef.current?.click()}
                    onFileChange={handleAvatarChange}
                    onDelete={handleDeleteAvatar}
                    isPublicValue={isPublicWatch}
                    onTogglePublic={handleTogglePublic}
                    onViewPublicProfile={user?.isPublic ? () => navigate(`/user/${user.username}`) : undefined}
                  />
                </div>

                {/* Right: Profile Form */}
                <div className="lg:w-2/3">
                  <form
                    key={user?.id}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Username */}
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Username
                      </label>
                      <input
                        {...register("username", {
                          pattern: {
                            value: /^[a-zA-Z0-9_]{3,20}$/,
                            message: "3-20 chars: letters, numbers, underscore",
                          },
                        })}
                        id="username"
                        placeholder="Choose a unique username"
                        className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
                      />
                      {errors.username && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.username.message as string}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Letters, numbers, underscore; 3–20 characters.
                      </p>
                    </div>
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Display Name
                      </label>
                      <input
                        {...register("name", {
                          maxLength: {
                            value: 50,
                            message: "Name must be 50 characters or less",
                          },
                        })}
                        type="text"
                        id="name"
                        placeholder="Your display name"
                        className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
                      />
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Bio */}
                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Bio
                      </label>
                      <textarea
                        {...register("bio", {
                          maxLength: {
                            value: 300,
                            message: "Bio must be 300 characters or less",
                          },
                        })}
                        id="bio"
                        rows={4}
                        placeholder="Tell us about yourself"
                        className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)] resize-none"
                      />
                      <div className="flex items-center justify-between mt-1">
                        {errors.bio && (
                          <p className="text-red-600 text-sm">
                            {errors.bio.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {bioValue.length} / 300
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={loading || !isDirty}
                        className="flex-1 px-6 py-3 bg-[#4FB286] text-white rounded-lg text-base font-medium hover:bg-[#3F9470] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading || !isDirty}
                        className="flex-1 px-6 py-3 border border-[#aaa] text-gray-700 rounded-lg text-base font-medium hover:border-[#4FB286] hover:text-[#4FB286] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    {isDirty && (
                      <p className="text-sm text-amber-600 text-center">
                        You have unsaved changes
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isVisibilityWarningOpen}
        title="Switch Profile to Private?"
        description={`Switching your profile to private will automatically unpublish your ${publicTripCount} public trip template${publicTripCount === 1 ? '' : 's'}.`}
        confirmText="Make Private & Unpublish"
        cancelText="Keep Profile Public"
        isWarning={true}
        isLoading={isSubmittingVisibility}
        onConfirm={handleConfirmPrivate}
        onCancel={handleCancelPrivateModal}
      />
    </>
  );
}
