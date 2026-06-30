import { Link } from 'react-router-dom';
import { Gauge, Calendar, DollarSign } from 'lucide-react';

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
}

function formatMileage(m) {
  return new Intl.NumberFormat('en-US').format(m);
}

export default function CarCard({ car }) {
  const thumb = car.images?.[0]
    ? `/uploads/${car.images[0]}`
    : null;

  return (
    <Link
      to={`/inventory/${car.id}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
    >
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l2-4h14l2 4M3 9h18M3 9v8a1 1 0 001 1h1m14 0h1a1 1 0 001-1V9M7 17h10M8 13h.01M16 13h.01" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
          {car.year} {car.make} {car.model}
        </h3>
        {car.color && <p className="text-sm text-gray-500">{car.color}</p>}
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{car.year}</span>
          <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{formatMileage(car.mileage)} mi</span>
        </div>
        <p className="text-blue-700 font-bold text-xl">{formatPrice(car.price)}</p>
      </div>
    </Link>
  );
}
