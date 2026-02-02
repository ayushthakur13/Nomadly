import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthRedirect } from "../hooks";
import Login from "./Login";
import Signup from "./Signup";
import { MinimalFooter } from "@/ui/common/";

const AuthPage = () => {
  const { isAuthenticated } = useAuthRedirect();

  if (isAuthenticated) return null;

  return (
    <div className="pt-2">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
      </Routes>
      <MinimalFooter />
    </div>
  );
};

export default AuthPage;
