import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  ThumbsUp, 
  ShieldCheck, 
  MessageSquarePlus, 
  X, 
  Upload, 
  CheckCircle2, 
  Sparkles,
  Camera
} from 'lucide-react';
import { ProductCategory } from '../types';

export const CustomerFeedback: React.FC = () => {
  const { reviews, addReview, likeReview, categories, selectedCategory, setSelectedCategory } = useApp();

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Printed T-Shirts');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const filteredReviews = selectedCategory === 'All' 
    ? reviews 
    : reviews.filter((r) => r.productCategory === selectedCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !comment) return;

    addReview({
      customerName,
      productCategory: category,
      productName: productName || category,
      rating,
      comment,
      verifiedBuyer: true,
      photoUrl: photoUrl || undefined,
    });

    setFeedbackModalOpen(false);
    setCustomerName('');
    setComment('');
    setProductName('');
    setPhotoUrl('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block mb-2">
            Verified Client Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Feedback & Trust Ratings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-medium">
            See real experiences, photos of completed print jobs, and reviews from companies, schools, event organizers, and families for Woodynat Designers Limited.
          </p>
        </div>

        <button
          onClick={() => setFeedbackModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review / Share Photos</span>
        </button>
      </div>

      {/* Overall Score Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl border border-slate-800">
        
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black text-amber-400">4.9</div>
          <div>
            <div className="flex text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <div className="text-xs text-slate-300 font-semibold">Based on 342+ Verified Orders</div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-y md:border-y-0 md:border-x border-slate-700/60 py-4 md:py-0 md:px-6">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">100% Quality Satisfaction</h4>
            <p className="text-[11px] text-slate-400">Free re-print guarantee if design proof deviates.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Fast Digital Proofing</h4>
            <p className="text-[11px] text-slate-400">Digital proofs sent on WhatsApp before printing.</p>
          </div>
        </div>

      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((rev) => (
          <div 
            key={rev.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{rev.customerName}</h4>
                    {rev.verifiedBuyer && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-blue-600 font-bold mt-0.5">{rev.productName}</p>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                "{rev.comment}"
              </p>

              {/* Uploaded Print Sample Photo if available */}
              {rev.photoUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100">
                  <img 
                    src={rev.photoUrl} 
                    alt="Finished Print Product" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t pt-3">
              <span>{rev.date}</span>

              <button
                onClick={() => likeReview(rev.id)}
                className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-bold cursor-pointer bg-slate-50 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({rev.likes})</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Leave a Review Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Submit Your Review & Print Photo</h3>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Name / Company:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kiprono M. (Apex Logistics)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Product Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Star Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Specific Item Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Custom Printed Hoodies or Eulogy Booklets"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Review Feedback:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details about print sharpness, delivery speed, and customer service..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Finished Product Photo URL (Optional):</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                Submit Verified Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
