import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquarePlus, 
  ShieldCheck, 
  Zap, 
  Filter, 
  X, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { Review, Product, Language } from '../types';
import { translations } from '../translations';
import { getLocalReviews, saveLocalReviews, addLocalReview } from '../lib/storeService';

interface ReviewsProps {
  products: Product[];
  lang: Language;
  onSelectProduct?: (product: Product) => void;
}

export const Reviews: React.FC<ReviewsProps> = ({
  products,
  lang,
  onSelectProduct
}) => {
  const t = translations[lang];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Trust summary statistics
  const [stats, setStats] = useState({
    averageRating: 4.9,
    totalCount: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
  });

  // Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formProductId, setFormProductId] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formVerified, setFormVerified] = useState(true);

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      let url = '/api/reviews';
      const params = new URLSearchParams();
      if (selectedProductId !== 'all') params.append('productId', selectedProductId);
      if (selectedRating !== 'all') params.append('rating', String(selectedRating));
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedRating, selectedProductId]);

  // Handle Like
  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedReviews[id]) return;

    // Optimistic UI update
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );
    setLikedReviews(prev => ({ ...prev, [id]: true }));

    try {
      await fetch(`/api/reviews/${id}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage(lang === 'my' ? 'သင့်အမည် ထည့်သွင်းပေးပါ' : 'Please enter your name');
      return;
    }
    if (!formComment.trim()) {
      setErrorMessage(lang === 'my' ? 'သုံးသပ်ချက် ရေးသားပေးပါ' : 'Please enter your review comment');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    try {
      const selectedProd = products.find(p => p.id === formProductId);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formName.trim(),
          rating: formRating,
          productId: formProductId || '',
          productTitle: selectedProd ? (selectedProd.titleMm || selectedProd.title) : '',
          comment: formComment.trim(),
          verifiedPurchase: formVerified
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Reset form
        setTimeout(() => {
          setIsWriteModalOpen(false);
          setSubmitSuccess(false);
          setFormName('');
          setFormComment('');
          setFormProductId('');
          fetchReviews();
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Failed to submit review');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick tag chips to append to comment
  const quickTags = lang === 'my' 
    ? ['⚡ တန်းရ ကီး', '✅ စိတ်ချရတယ်', '💬 Support အရမ်းမြန်တယ်', '💰 စျေးတန်တယ်', '🌟 Recommend ပေးပါတယ်']
    : ['⚡ Instant Delivery', '✅ 100% Genuine', '💬 Fast Support', '💰 Great Value', '🌟 Highly Recommended'];

  const handleAddTag = (tag: string) => {
    setFormComment(prev => (prev ? `${prev} | ${tag}` : tag));
  };

  return (
    <section className="py-12 bg-linear-to-b from-[#FAF8F5] via-white to-[#FAF6F0] border-t border-[#EAE2D5]" id="reviews">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5A2B]/10 text-[#8B5A2B] text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Verified Customer Trust</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2D1F17] tracking-tight">
              {t.customerReviews}
            </h2>
            <p className="text-xs sm:text-sm text-[#7C6A5A] mt-1 max-w-xl">
              {t.reviewsSubtitle}
            </p>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="self-start md:self-auto py-2.5 px-5 rounded-2xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{t.writeReview}</span>
          </button>
        </div>

        {/* Trust Metric Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD3] shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Score & Stars */}
            <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left border-b md:border-b-0 md:border-r border-[#EDE4D9] pb-6 md:pb-0 md:pr-6">
              <span className="text-5xl font-black text-[#2D1F17] tracking-tight">
                {stats.averageRating}
              </span>
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-stone-200 text-stone-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#7C6A5A] font-semibold">
                {lang === 'my' 
                  ? `ဝယ်ယူသူ စုစုပေါင်း ${stats.totalCount || reviews.length} ဦး၏ သုံးသပ်ချက်`
                  : `Based on ${stats.totalCount || reviews.length} verified customer reviews`}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Verified Purchases</span>
              </div>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="md:col-span-5 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingCounts[star] || 0;
                const total = stats.totalCount || (reviews.length || 1);
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(selectedRating === star ? 'all' : star)}
                    className={`w-full flex items-center gap-3 text-xs group cursor-pointer p-1 rounded-lg transition ${
                      selectedRating === star ? 'bg-[#F5ECE3]' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="w-12 font-bold text-[#5C3618] flex items-center gap-1 justify-end">
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-linear-to-r from-amber-400 to-[#8B5A2B] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-stone-500 font-semibold text-[11px]">
                      {count} ({percent}%)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Trust Highlights */}
            <div className="md:col-span-3 bg-[#FAF6F0] rounded-2xl p-4 border border-[#EFE5D8] space-y-3">
              <span className="text-[11px] font-bold uppercase text-[#8B5A2B] tracking-wider block">
                {lang === 'my' ? 'ဘာကြောင့် Lin Htet ကို ရွေးချယ်သင့်သလဲ' : 'Why Customers Trust Us'}
              </span>
              <ul className="text-xs space-y-2 text-[#4A3B30] font-medium">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-[#8B5A2B] shrink-0 mt-0.5" />
                  <span>{lang === 'my' ? 'တန်းရ Digital Key စနစ်' : 'Instant Automated Key Delivery'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{lang === 'my' ? '၁၀၀% မူရင်း Genuine Retail' : '100% Genuine Retail Licenses'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#8B5A2B] shrink-0 mt-0.5" />
                  <span>{lang === 'my' ? 'Telegram & WhatsApp တိုက်ရိုက် Support' : 'Live Telegram & WhatsApp Support'}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-[#EDE4D9]">
          
          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedRating('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedRating === 'all'
                  ? 'bg-[#8B5A2B] text-white shadow-xs'
                  : 'bg-stone-50 text-[#544337] hover:bg-stone-100'
              }`}
            >
              {t.allRatings} ({stats.totalCount || reviews.length})
            </button>
            {[5, 4, 3].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedRating(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
                  selectedRating === num
                    ? 'bg-[#8B5A2B] text-white shadow-xs'
                    : 'bg-stone-50 text-[#544337] hover:bg-stone-100'
                }`}
              >
                <span>{num}</span>
                <Star className={`w-3 h-3 ${selectedRating === num ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
              </button>
            ))}
          </div>

          {/* Product Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7C6A5A] font-medium whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#8B5A2B]" />
              {lang === 'my' ? 'ပစ္စည်းအလိုက်:' : 'Product:'}
            </span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-[#FAF8F5] border border-[#D5C2B1] rounded-xl px-2.5 py-1.5 text-xs text-[#2D1F17] font-semibold focus:outline-none focus:border-[#8B5A2B] cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">{lang === 'my' ? 'ပစ္စည်းအားလုံး' : 'All Products'}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === 'my' && p.titleMm ? p.titleMm : p.title}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-48 animate-pulse border border-[#EDE4D9] p-5" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#EDE4D9] p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF6F0] text-[#8B5A2B] mx-auto flex items-center justify-center">
              <Star className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-[#2D1F17]">
              {lang === 'my' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုနှင့် ကိုက်ညီသည့် Review မရှိသေးပါ' : 'No reviews match this filter'}
            </h3>
            <p className="text-xs text-[#7C6A5A]">
              {lang === 'my' ? 'ပထမဆုံး သုံးသပ်ချက်ကို သင်ကိုယ်တိုင် စတင်ရေးသားနိုင်ပါသည်' : 'Be the first to share your experience with Lin Htet IT Service!'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => { setSelectedRating('all'); setSelectedProductId('all'); }}
                className="py-1.5 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
              >
                {lang === 'my' ? 'စစ်ထုတ်မှု ပြန်လည်ရှင်းလင်းရန်' : 'Reset Filter'}
              </button>
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="py-1.5 px-4 rounded-xl bg-[#8B5A2B] text-white text-xs font-bold hover:bg-[#72451E] transition cursor-pointer"
              >
                {t.writeReview}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((rev) => {
              const initial = rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'U';
              const dateStr = new Date(rev.createdAt).toLocaleDateString(lang === 'my' ? 'my-MM' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-5 border border-[#E8DFD3] hover:border-[#8B5A2B]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Avatar, Name, Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#8B5A2B] to-[#5C3618] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {initial}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#2D1F17] leading-tight flex items-center gap-1.5">
                            <span>{rev.customerName}</span>
                          </h4>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>{t.verifiedBuyer}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-stone-200 text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product Badge Tag */}
                    {rev.productTitle && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF6F0] text-[#7C4A21] border border-[#EDE4D9] text-[11px] font-semibold max-w-full truncate">
                        <ShoppingBag className="w-3 h-3 shrink-0 text-[#8B5A2B]" />
                        <span className="truncate">{rev.productTitle}</span>
                      </div>
                    )}

                    {/* Review Comment */}
                    <p className="text-xs sm:text-sm text-[#4A3B30] leading-relaxed font-normal">
                      "{lang === 'my' && rev.commentMm ? rev.commentMm : rev.comment}"
                    </p>
                  </div>

                  {/* Footer: Date & Like Counter */}
                  <div className="mt-4 pt-3 border-t border-[#F0E8DF] flex items-center justify-between text-xs text-[#8C7A6D]">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-[#A8988B]" />
                      <span>{dateStr}</span>
                    </span>

                    <button
                      onClick={(e) => handleLike(rev.id, e)}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl transition cursor-pointer text-[11px] font-bold ${
                        likedReviews[rev.id]
                          ? 'bg-[#8B5A2B]/10 text-[#8B5A2B]'
                          : 'hover:bg-stone-100 text-stone-600'
                      }`}
                      title="Helpful Review"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${likedReviews[rev.id] ? 'fill-[#8B5A2B]' : ''}`} />
                      <span>{rev.likes || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E8DFD3] overflow-hidden relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-linear-to-r from-[#FAF6F0] to-white border-b border-[#EDE4D9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8B5A2B] text-white flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2D1F17]">
                    {t.writeReview}
                  </h3>
                  <p className="text-[11px] text-[#7C6A5A]">
                    Lin Htet IT Service Customer Feedback
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitReview} className="p-6 overflow-y-auto space-y-4">
              {submitSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-800">
                    {t.reviewSubmitted}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {lang === 'my' ? 'သင့် review အား database ထဲတွင် ထည့်သွင်းပြီးပါပြီ' : 'Your review has been saved to the database.'}
                  </p>
                </div>
              ) : (
                <>
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                      {errorMessage}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div className="text-center space-y-1 py-2 bg-[#FAF8F5] rounded-2xl border border-[#EFE5D8]">
                    <span className="text-xs font-bold text-[#5C3618] block">
                      {t.yourRating}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (formHoverRating || formRating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onMouseEnter={() => setFormHoverRating(star)}
                            onMouseLeave={() => setFormHoverRating(0)}
                            onClick={() => setFormRating(star)}
                            className="p-1 cursor-pointer transition transform hover:scale-110"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                active
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-stone-200 text-stone-200'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-extrabold text-[#8B5A2B] block">
                      {formRating === 5 && (lang === 'my' ? 'အလွန်ကောင်းမွန်ပါသည် (5/5 Excellent)' : '5/5 - Outstanding!')}
                      {formRating === 4 && (lang === 'my' ? 'စိတ်ကျေနပ်မှုရှိပါသည် (4/5 Very Good)' : '4/5 - Very Good')}
                      {formRating === 3 && (lang === 'my' ? 'အသင့်အတင့် (3/5 Good)' : '3/5 - Good')}
                      {formRating <= 2 && (lang === 'my' ? 'တိုးတက်ရန်လိုပါသည် (Needs Improvement)' : 'Needs Improvement')}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3D2412] flex items-center justify-between">
                      <span>{t.yourName} *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={lang === 'my' ? 'ဥပမာ - ကိုကျော်ဇင်ဦး' : 'e.g. John / Ko Kyaw'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2B1] text-xs sm:text-sm focus:outline-none focus:border-[#8B5A2B] bg-[#FAF8F5]"
                    />
                  </div>

                  {/* Product Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3D2412]">
                      {t.selectProduct}
                    </label>
                    <select
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2B1] text-xs sm:text-sm focus:outline-none focus:border-[#8B5A2B] bg-[#FAF8F5] cursor-pointer"
                    >
                      <option value="">{lang === 'my' ? '-- ဝယ်ယူခဲ့သော ပစ္စည်းရွေးပါ (မဖြစ်မနေမဟုတ်) --' : '-- Select Product (Optional) --'}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {lang === 'my' && p.titleMm ? p.titleMm : p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Tag Recommendations */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#7C6A5A] font-semibold block">
                      {lang === 'my' ? 'အမြန်ထည့်ရန်:' : 'Quick Tags:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-[#8B5A2B]/10 hover:text-[#8B5A2B] text-[11px] font-medium text-stone-600 transition cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3D2412]">
                      {t.yourComment} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder={
                        lang === 'my'
                          ? 'ဝန်ဆောင်မှု အတွေ့အကြုံ၊ ကီးရရှိမှု မြန်ဆန်မှုနှင့် အကြံပြုချက်များကို ရေးသားပေးပါ...'
                          : 'Share your delivery experience, speed, and feedback...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2B1] text-xs sm:text-sm focus:outline-none focus:border-[#8B5A2B] bg-[#FAF8F5] resize-none"
                    />
                  </div>

                  {/* Verified Buyer Checkbox */}
                  <label className="flex items-center gap-2 text-xs text-[#5C3618] cursor-pointer pt-1 font-medium">
                    <input
                      type="checkbox"
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8B5A2B] focus:ring-[#8B5A2B] accent-[#8B5A2B]"
                    />
                    <span>{lang === 'my' ? 'ကျွန်ုပ်သည် Lin Htet IT Service ၏ တကယ့် ဝယ်ယူသူဖြစ်ပါသည်' : 'I am a real customer of Lin Htet IT Service'}</span>
                  </label>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-2xl bg-[#8B5A2B] hover:bg-[#72451E] disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <span>{t.processing}</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t.submitReview}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
