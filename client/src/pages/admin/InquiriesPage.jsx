import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import api from '../../api';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/inquiries')
      .then(({ data }) => { setInquiries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Inquiries</h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{inq.name}</p>
                  <p className="text-sm text-gray-500">
                    <a href={`mailto:${inq.email}`} className="hover:text-blue-600">{inq.email}</a>
                    {inq.phone && <> · {inq.phone}</>}
                  </p>
                </div>
                <div className="text-right">
                  {inq.make && (
                    <p className="text-sm font-medium text-blue-700">{inq.year} {inq.make} {inq.model}</p>
                  )}
                  <p className="text-xs text-gray-400">{new Date(inq.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{inq.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
