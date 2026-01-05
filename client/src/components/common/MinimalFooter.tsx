const MinimalFooter = () => {
  return (
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
  );
};

export default MinimalFooter;
