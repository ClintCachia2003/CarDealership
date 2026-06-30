import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Car className="w-5 h-5 text-blue-400" />
            AutoPrime Motors
          </div>
          <p className="text-sm">© {new Date().getFullYear()} AutoPrime Motors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
