import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { extractApiError } from "@/utils/errorHandling";
import { Icon } from "@/ui/icon/";
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  logout,
  secureLogout
} from "@/features/auth";
import api from "@/services/api";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { TOAST_MESSAGES } from "@/constants/toastMessages";
import { AvatarManager, SecuritySection } from "../components";

interface ProfileFormData {
  username: string;
  name: string;
  bio: string;
  isPublic: boolean;
}

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: any) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
  } = useForm<ProfileFormData>();

  useEffect(() => {
    fetchProfile(async () => {
      const { data } = await api.get("/users/me");
      const profile = data.data.user;
      reset({
        username: profile.username ?? "",
        name: profile.name ?? "",
        bio: profile.bio ?? "",
        isPublic: profile.isPublic ?? false,
      });
    });
  }, [reset, fetchProfile]);

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
        const { data: response } = await api.patch("/users/me", updates);
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
          const { data: response } = await api.patch("/users/me/username", {
            username: newUsername,
          });
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
      const { data: response } = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(updateProfileSuccess({ user: response.data.user }));
      URL.revokeObjectURL(preview);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteAvatar = async () => {
    if (!user?.profilePicUrl) return;

    await deleteAvatar(async () => {
      const { data: response } = await api.delete("/users/me/avatar");
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
  const { execute: performLogout, isLoading: loggingOut } = useAsyncAction({
    showToast: false,
    onSuccess: () => {
      dispatch(logout());
      navigate('/', { replace: true });
    }
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users/me");
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
      await api.patch("/users/me/password", payload);
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
    await performLogout(async () => {
      await secureLogout();
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2E2E2E]">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your profile information and preferences
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
                    isPublicRegister={register("isPublic")}
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

                  {/* Security */}
                  <SecuritySection
                    hasPassword={hasPassword}
                    currentPassword={currentPassword}
                    newPassword={newPassword}
                    confirmPassword={confirmPassword}
                    setCurrentPassword={setCurrentPassword}
                    setNewPassword={setNewPassword}
                    setConfirmPassword={setConfirmPassword}
                    pwdLoading={pwdLoading}
                    onChangePassword={handleChangePassword}
                  />

                  {/* Danger Zone - Logout */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Logout</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Sign out of your account on this device
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Icon name="logout" size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
