import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

const AuthPage = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div>
      <div className="pt-2">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        {/* Minimal auth footer for trust & orientation */}
        <footer className="mt-12 py-6 text-center text-xs text-gray-500 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 mb-4">
            <a
              href="/privacy"
              className="hover:text-gray-700 hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="/terms"
              className="hover:text-gray-700 hover:underline transition-colors"
            >
              Terms of Service
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="/contact"
              className="hover:text-gray-700 hover:underline transition-colors"
            >
              Contact Us
            </a>
          </div>
          <p className="text-gray-400">© 2025 Nomadly. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage;
