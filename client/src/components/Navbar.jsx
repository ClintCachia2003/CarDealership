import { Link, NavLink } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-blue-700 font-bold text-xl">
            <Car className="w-6 h-6" />
            <span>AutoPrime</span>
          </Link>
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`
              }
            >
              Inventory
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
