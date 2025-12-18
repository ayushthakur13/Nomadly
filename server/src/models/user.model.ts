import { Schema, model, Document } from "mongoose";
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email?: string | null;
  // stored hashed password
  passwordHash?: string | null;
  // virtual plain password (not persisted) can be set during registration
  // name/profile
  name?: string;
  bio?: string;
  profilePicUrl?: string;
  profilePicPublicId?: string;
  // public profile flag and admin flag
  isPublic: boolean;
  isAdmin?: boolean;
  roles: string[]; // ['user','admin']
  // top-level google id for easier querying
  googleId?: string | null;
  refreshTokenHash?: string | null;
  stats?: {
    tripsCount: number;
    likesCount: number;
    followersCount: number;
  };
  createdAt: Date;
  updatedAt: Date;

  // instance methods
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, default: null },
    name: { type: String },
    bio: { type: String, maxlength: 300, default: "" },
    profilePicUrl: { type: String },
    profilePicPublicId: { type: String },
    isPublic: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    roles: { type: [String], default: ["user"] },
    googleId: { type: String, default: null },
    refreshTokenHash: { type: String, default: null },
    stats: {
      tripsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Temporary holder for plain password during create/update
userSchema.virtual('_plainPassword').set(function(this: any, v: string) {
  // store plain password in internal property for pre-save hook
  this._tempPassword = v;
});

// Hash plain password before save if provided
userSchema.pre('save', async function(next) {
  try {
    const doc = this as any;
    if (doc._tempPassword) {
      const saltRounds = 10;
      const hash = await bcrypt.hash(doc._tempPassword, saltRounds);
      doc.passwordHash = hash;
      // remove the temporary value
      delete doc._tempPassword;
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

// Compare a candidate password with stored hash
userSchema.methods.comparePassword = async function(password: string) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export default model<IUser>("User", userSchema);
