import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Gauge, Fuel, Settings2, Palette, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
}
function formatMileage(m) {
  return new Intl.NumberFormat('en-US').format(m);
}

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/cars/${id}`)
      .then(({ data }) => { setCar(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!car) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
      <p className="text-gray-500 text-lg">Vehicle not found.</p>
      <Link to="/inventory" className="text-blue-600 hover:underline">Back to inventory</Link>
    </div>
  );

  const images = car.images || [];
  const prev = () => setImgIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setImgIdx((i) => (i + 1) % images.length);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/inquiries', { ...form, carId: car.id });
      toast.success('Message sent! We\'ll be in touch soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: car.year },
    { icon: Gauge, label: 'Mileage', value: `${formatMileage(car.mileage)} mi` },
    { icon: Fuel, label: 'Fuel Type', value: car.fuel_type || '—' },
    { icon: Settings2, label: 'Transmission', value: car.transmission || '—' },
    { icon: Palette, label: 'Color', value: car.color || '—' },
    { icon: Hash, label: 'VIN', value: car.vin || '—' },
  ];

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/inventory" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Inventory
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-[16/10]">
              {images.length > 0 ? (
                <>
                  <img
                    src={`/uploads/${images[imgIdx]}`}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l2-4h14l2 4M3 9h18M3 9v8a1 1 0 001 1h1m14 0h1a1 1 0 001-1V9M7 17h10" />
                  </svg>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img src={`/uploads/${img}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {car.year} {car.make} {car.model}
              </h1>
              <p className="text-3xl font-bold text-blue-700 mb-4">{formatPrice(car.price)}</p>
              {car.description && (
                <p className="text-gray-600 leading-relaxed mb-6 border-b border-gray-100 pb-6">{car.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquiry form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enquire About This Vehicle</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  required type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  required rows={3}
                  placeholder="Your message..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Sending…' : 'Send Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
