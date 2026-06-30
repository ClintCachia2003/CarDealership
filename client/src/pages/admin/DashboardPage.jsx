import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, DollarSign, CheckCircle, Clock, Pencil, Tag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
}
function formatMileage(m) {
  return new Intl.NumberFormat('en-US').format(m);
}

export default function DashboardPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = () => {
    api.get('/cars/admin/all')
      .then(({ data }) => { setCars(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCars(); }, []);

  const toggleStatus = async (car) => {
    const newStatus = car.status === 'available' ? 'sold' : 'available';
    try {
      await api.patch(`/cars/${car.id}/status`, { status: newStatus });
      setCars((prev) => prev.map((c) => c.id === car.id ? { ...c, status: newStatus } : c));
      toast.success(`Marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteCar = async (car) => {
    if (!confirm(`Delete ${car.year} ${car.make} ${car.model}? This cannot be undone.`)) return;
    try {
      await api.delete(`/cars/${car.id}`);
      setCars((prev) => prev.filter((c) => c.id !== car.id));
      toast.success('Car removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const available = cars.filter((c) => c.status === 'available');
  const sold = cars.filter((c) => c.status === 'sold');
  const totalValue = available.reduce((s, c) => s + c.price, 0);

  const stats = [
    { icon: Car, label: 'Available', value: available.length, color: 'blue' },
    { icon: CheckCircle, label: 'Sold', value: sold.length, color: 'green' },
    { icon: DollarSign, label: 'Total Value', value: formatPrice(totalValue), color: 'purple' },
    { icon: Clock, label: 'Total Listings', value: cars.length, color: 'orange' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your vehicle inventory</p>
        </div>
        <Link
          to="/admin/cars/new"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          <Car className="w-4 h-4" />
          Add New Car
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${colorMap[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Vehicles</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : cars.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No vehicles yet.</p>
            <Link to="/admin/cars/new" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
              Add your first car →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mileage</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {car.images?.[0] ? (
                            <img src={`/uploads/${car.images[0]}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Car className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{car.year} {car.make} {car.model}</p>
                          {car.vin && <p className="text-xs text-gray-400">VIN: {car.vin}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">{formatPrice(car.price)}</td>
                    <td className="px-4 py-4 text-gray-600">{formatMileage(car.mileage)} mi</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        car.status === 'available'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {car.status === 'available' ? 'Available' : 'Sold'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/cars/${car.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleStatus(car)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            car.status === 'available'
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={car.status === 'available' ? 'Mark as Sold' : 'Mark as Available'}
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCar(car)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
