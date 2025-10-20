import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white p-6 flex justify-between items-center">
      <div className="text-2xl font-bold">Weather Hub</div>
      <div className="space-x-4">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/locations" className="hover:underline">
          Locations
        </Link>
        <Link to="/compare" className="hover:underline">
          Compare
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </nav>
  );
}
