import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Wrench, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            {/* Placeholder logo area */}
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-6">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Trusted Dealer Since 2008
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Your Perfect<br />
              <span className="text-blue-300">Drive Today</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl">
              Browse our handpicked selection of quality vehicles. Every car is inspected, priced fairly, and ready to go.
            </p>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 bg-white text-blue-800 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              Browse Inventory
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose AutoPrime?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Fully Inspected', desc: 'Every vehicle passes our rigorous 150-point inspection before hitting the lot.' },
              { icon: Wrench, title: 'Service Guarantee', desc: 'We stand behind every sale with a 30-day mechanical guarantee.' },
              { icon: Star, title: 'Best Price Promise', desc: 'Transparent pricing with no hidden fees. What you see is what you pay.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <Icon className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to find your car?</h2>
          <p className="text-gray-500 mb-8 text-lg">Over 50 vehicles in stock and updated weekly.</p>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-800 transition-colors text-lg"
          >
            View All Inventory
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
