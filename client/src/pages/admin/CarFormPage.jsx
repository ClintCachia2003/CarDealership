import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'Other'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'];

const EMPTY_FORM = {
  make: '', model: '', year: '', price: '', mileage: '',
  vin: '', color: '', description: '', fuelType: '', transmission: '', status: 'available',
};

export default function CarFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/cars/${id}`).then(({ data }) => {
      setForm({
        make: data.make, model: data.model, year: data.year, price: data.price,
        mileage: data.mileage, vin: data.vin || '', color: data.color || '',
        description: data.description || '', fuelType: data.fuel_type || '',
        transmission: data.transmission || '', status: data.status,
      });
      setExistingImages(data.images || []);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load car'); navigate('/admin'); });
  }, [id, isEdit, navigate]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.type.startsWith('image/'));
    setNewFiles((prev) => [...prev, ...valid]);
    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewFile = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDeleteExisting = (filename) => {
    setDeleteImages((prev) =>
      prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]
    );
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newFiles.forEach((f) => fd.append('images', f));
      deleteImages.forEach((f) => fd.append('deleteImages', f));

      if (isEdit) {
        await api.put(`/cars/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Car updated');
      } else {
        await api.post('/cars', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Car added');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <button
        onClick={() => navigate('/admin')}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Make *</label>
              <input required value={form.make} onChange={set('make')} placeholder="e.g. Toyota" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Model *</label>
              <input required value={form.model} onChange={set('model')} placeholder="e.g. Camry" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
              <input required type="number" min="1900" max="2030" value={form.year} onChange={set('year')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price (USD) *</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mileage *</label>
              <input required type="number" min="0" value={form.mileage} onChange={set('mileage')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">VIN</label>
              <input value={form.vin} onChange={set('vin')} placeholder="Optional" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
              <input value={form.color} onChange={set('color')} placeholder="e.g. Midnight Black" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fuel Type</label>
              <select value={form.fuelType} onChange={set('fuelType')} className={inputCls}>
                <option value="">Select…</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Transmission</label>
              <select value={form.transmission} onChange={set('transmission')} className={inputCls}>
                <option value="">Select…</option>
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={set('status')} className={inputCls}>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the vehicle…"
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Photos</h2>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Current photos (click to mark for removal)</p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((fn) => (
                  <div
                    key={fn}
                    onClick={() => toggleDeleteExisting(fn)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden w-24 h-20 border-2 transition-all ${
                      deleteImages.includes(fn) ? 'border-red-500 opacity-50' : 'border-transparent'
                    }`}
                  >
                    <img src={`/uploads/${fn}`} alt="" className="w-full h-full object-cover" />
                    {deleteImages.includes(fn) && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <X className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {previews.map((url, i) => (
                <div key={url} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-xl px-6 py-4 text-sm transition-colors w-full justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload Photos (up to 10, max 10MB each)
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
