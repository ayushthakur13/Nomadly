import React from 'react';
import { Icon } from '@/ui/icon/';

interface AvatarManagerProps {
  user: any;
  avatarPreview: string | null;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPickFile: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  isPublicRegister: any;
}

export default function AvatarManager({
  user,
  avatarPreview,
  uploading,
  fileInputRef,
  onPickFile,
  onFileChange,
  onDelete,
  isPublicRegister,
}: AvatarManagerProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 bg-gray-100">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : user?.profilePicUrl ? (
            <img
              src={user.profilePicUrl}
              alt={user.name || user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-100">
              <Icon name="user" size={48} className="text-emerald-600" />
            </div>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="font-semibold text-lg text-[#2E2E2E]">{user?.name || user?.username}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      <div className="mt-6 w-full space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={onFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={onPickFile}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="upload" size={18} />
          <span>Upload Photo</span>
        </button>

        {user?.profilePicUrl && (
          <button
            type="button"
            onClick={onDelete}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="close" size={18} />
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">JPG, PNG or WebP. Max 5MB.</p>

      {/* Public Profile Toggle */}
      <div className="mt-6 w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700">
              Public Profile
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Make your profile visible to other users
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              {...isPublicRegister}
              type="checkbox"
              id="isPublic"
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
