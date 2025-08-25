import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";

type HeaderProps = {
  btnText: string;
};

function Header({ btnText }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/sign-in");
  };

  return (
    <>
      <div
        className="header fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-[1300px] z-50 flex justify-between items-center px-4 md:px-10 py-4 bg-white/10 rounded-b-xl shadow-md backdrop-blur"
        dir="ltr"
      >
        {/* Logo */}
        <Link to="/home">
          <img src="./logo.png" alt="Z-Task-Logo" className="h-12 md:h-13" />
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Create Post button */}
              <Link
                to="/create-post"
                className="inline-flex items-center gap-1 hover:bg-blue-950 text-white px-3 py-2 rounded-lg transition"
              >
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-labelledby="addIconTitle"
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  fill="none"
                  color="#ffffff"
                >
                  <title id="addIconTitle">Add</title>
                  <path d="M17 12L7 12M12 17L12 7" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Create Post
              </Link>

              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                {user.profileImage && !imageError ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={() => setImageError(true)} 
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg
                      fill="#ffffff"
                      width="full"
                      height="full"
                      viewBox="0 0 30.586 30.586"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g transform="translate(-546.269 -195.397)">
                        <path d="M572.138,221.245a15.738,15.738,0,0,0-21.065-.253l-1.322-1.5a17.738,17.738,0,0,1,23.741.28Z" />
                        <path d="M561.464,204.152a4.96,4.96,0,1,1-4.96,4.96,4.966,4.966,0,0,1,4.96-4.96m0-2a6.96,6.96,0,1,0,6.96,6.96,6.96,6.96,0,0,0-6.96-6.96Z" />
                        <path d="M561.562,197.4a13.293,13.293,0,1,1-13.293,13.293A13.308,13.308,0,0,1,561.562,197.4m0-2a15.293,15.293,0,1,0,15.293,15.293A15.293,15.293,0,0,0,561.562,195.4Z" />
                      </g>
                    </svg>
                  </div>
                )}

                <span className="hidden md:inline text-lg text-white">
                  {user.name}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-lg text-white px-3 py-2 rounded-lg hover:bg-blue-950 transition duration-300 ease-in-out cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <nav className="flex items-center gap-0">
              <NavLink
                to="/sign-in"
                className="NavLink cursor-pointer border flex items-center justify-center rounded-lg transition duration-200"
              >
                {btnText}
              </NavLink>
            </nav>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`px-4 py-2 border rounded-lg text-white transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-blue-500  ${
                menuOpen
                  ? "hover:bg-red-500/20 hover:border-red-400"
                  : "hover:bg-white/10"
              }`}
          >
            {menuOpen ? (
              // X icon
              <div className="flex items-center gap-2 cursor-pointer">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm">Close</span>
              </div>
            ) : (
              // Menu icon
              <div className="flex items-center gap-2 cursor-pointer">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12H21M3 6H21M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm">Menu</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu  */}
      {menuOpen && (
        <>
          {/* close menu when click outside  */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur z-30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          ></div>

          <div className="lg:hidden mt-[-30px] text-lg backdrop-blur bg-white/10 fixed top-[140px] left-1/2 -translate-x-1/2 w-[90%] text-center rounded-xl shadow-md py-4 z-40 border border-white/20">
            <nav className="flex flex-col gap-3 w-[90%] mx-auto">
              {user ? (
                <>
                  <div className="flex flex-col items-center gap-2 p-2">
                    {user.profileImage && !imageError ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                        <svg
                          fill="#ffffff"
                          width="full"
                          height="full"
                          viewBox="0 0 30.586 30.586"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g transform="translate(-546.269 -195.397)">
                            <path d="M572.138,221.245a15.738,15.738,0,0,0-21.065-.253l-1.322-1.5a17.738,17.738,0,0,1,23.741.28Z" />
                            <path d="M561.464,204.152a4.96,4.96,0,1,1-4.96,4.96,4.966,4.966,0,0,1,4.96-4.96m0-2a6.96,6.96,0,1,0,6.96,6.96,6.96,6.96,0,0,0-6.96-6.96Z" />
                            <path d="M561.562,197.4a13.293,13.293,0,1,1-13.293,13.293A13.308,13.308,0,0,1,561.562,197.4m0-2a15.293,15.293,0,1,0,15.293,15.293A15.293,15.293,0,0,0,561.562,195.4Z" />
                          </g>
                        </svg>
                      </div>
                    )}
                    <span className="text-white">{user.name}</span>
                  </div>

                  {/* Create Post in mobile menu */}
                  <Link
                    to="/create-post"
                    onClick={() => setMenuOpen(false)}
                    className="NavLink flex items-center gap-2 justify-center px-3 py-2 rounded transition border text-blue-400 hover:bg-white/10"
                  >
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 24 24"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-labelledby="addIconTitle"
                      stroke="#60a5fa"
                      strokeWidth="1"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      fill="none"
                      color="#60a5fa"
                    >
                      <title id="addIconTitle">Add</title>
                      <path d="M17 12L7 12M12 17L12 7" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Create Post
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="NavLink px-3 py-2 rounded transition border text-red-400 hover:bg-white/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="NavLink px-3 py-2 rounded transition border hover:bg-white/10"
                >
                  {btnText}
                </NavLink>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

export default Header;
