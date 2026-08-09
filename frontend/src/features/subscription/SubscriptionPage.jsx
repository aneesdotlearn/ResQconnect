import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CreditCard, CheckCircle, Star, Zap, Building2,
  ArrowRight, Receipt, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import illustrator from '@/assets/bg/illustrator.png';

const PLANS = [
  {
    id: 'basic', name: 'Basic', price: '₹199', period: '/month', icon: Star,
    features: ['SOS Alerts', 'Live Tracking', '5 Emergency Contacts', '3 Safe Zones', 'Incident Reporting', 'SMS Notifications'],
  },
  {
    id: 'premium', name: 'Premium', price: '₹499', period: '/month', icon: Zap, popular: true,
    features: ['Everything in Basic', '10 Emergency Contacts', '20 Safe Zones', 'AI Risk Analysis', 'Voice Activation', 'Priority Support'],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: '₹999', period: '/month', icon: Building2,
    features: ['Everything in Premium', 'Unlimited Contacts', 'Unlimited Zones', 'Admin Dashboard', 'Analytics Export', 'Dedicated Support'],
  },
];

const AUTO_ADVANCE_MS = 2000;

// ─── Plan Card ────────────────────────────────────────────────────────────────
// slot: 'center' | 'side' — controls size/scale/color, independent of which plan it holds
function PlanCard({ plan, slot, isCurrent, processing, onRazorpay, onStripe }) {
  const isCenter = slot === 'center';
return (
  <div
    className={`rounded-3xl overflow-hidden transition-all duration-500 ease-out ${
      isCenter
        ? "relative z-10 w-full min-w-[40rem] shadow-2xl"
        : "bg-white text-charcoal border border-border p-4 scale-90 opacity-60 w-full max-w-[13rem]"
    }`}
  >
    {isCenter ? (
      <>
        <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent-500/80 text-white text-xs font-bold px-4 py-1 rounded-full z-20">
          Most Popular
        </span>

        <div className="grid grid-cols-[60%_40%] min-h-[33rem]">
             {/* RIGHT */}
          <div className="relative p-10 flex flex-col text-white">

            <ul className="py-4 px-8 flex items-left flex-col text-accent-800 space-y-5 flex-1">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center text-center gap-3 text-lg"
                >
                  <CheckCircle
                    size={20}
                    className="text-accent-300/70 flex-shrink-0"
                  />
                  {f}
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <div className="flex items-center justify-center gap-2 py-4 rounded-xl bg-white/10 font-semibold ">
                <CheckCircle size={18} />
                Current Plan
              </div>
            ) : (
              <div className="space-y-3 mt-8">
                <button
                  onClick={() => onRazorpay(plan.id)}
                  disabled={processing}
                  className="w-full py-4 rounded-xl border border-accent-800/10 glass-card text-accent-400 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-accent-100/40 hover:text-accent-700 hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-accent-800/10 transition-colors"
                >
                  <CreditCard size={18} />
                  {processing ? "Processing..." : "Pay with Razorpay"}
                </button>

                <button
                  onClick={() => onStripe(plan.id)}
                  disabled={processing}
                //   className="w-full py-4 rounded-xl glass-card border border-white/20 bg-accent-600 hover:bg-accent-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-accent-800/10 transition-colors"
                // >
                  className="w-full py-4 rounded-xl border border-accent-800/10 glass-card text-accent-400 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-accent-100/40 hover:text-accent-700 hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-accent-800/10 transition-colors"
                >
                  <ArrowRight size={18} />
                  Checkout with Stripe
                </button>
              </div>
            )}

          </div>

          {/* LEFT */}
          <div className="relative bg-gradient-to-br from-accent-300 via-accent-400 to-accent-500 p-10 flex flex-col justify-center" style={{
                        backgroundImage: `url(${illustrator})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: -1,
                      }}>            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-gradientStart via-accent-400/90 to-accent-800 z-0"></div>

            {/* <div className="absolute top-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-black/15 backdrop-blur flex items-center justify-center text-yellow-400/80 mb-8">
              <plan.icon size={28} />
            </div> */}

            <h3 className="font-display font-bold text-4xl text-accent-800 z-10">
              {plan.name}
            </h3>

            <div className="flex items-end mt-3">
              <span className="font-display font-black text-6xl text-white z-10">
                {plan.price}
              </span>

              <span className="ml-1 mb-2 text-lg text-white/70 z-10">
                {plan.period}
              </span>
            </div>

          </div>

         

        </div>
      </>
    ) : (
      <div className="rounded-3xl flex flex-col h-full">
        <div
          className="rounded-xl flex items-center justify-center mb-3 flex-shrink-0 w-8 h-8 bg-accent-50 text-accent-600"
        >
          <plan.icon size={14} />
        </div>

        <h3 className="font-display font-bold text-sm">
          {plan.name}
        </h3>

        <div className="flex items-end gap-0.5 mt-0.5 mb-3">
          <span className="font-display font-black text-lg">
            {plan.price}
          </span>

          <span className="text-xs text-charcoal/40">
            {plan.period}
          </span>
        </div>

        <div className="mt-1">
          <p className="text-xs text-charcoal/50">
            {plan.features.length} features
          </p>

          {isCurrent && (
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-accent-600">
              <CheckCircle size={12} />
              Current
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
function PlanCarousel({ currentPlan, subStatus, processingPlan, onRazorpay, onStripe }) {
  const initialIndex = Math.max(PLANS.findIndex((p) => p.popular), 0);
  const [centerIndex, setCenterIndex] = useState(initialIndex);
  const timerRef = useRef(null);

  const advance = useCallback((dir) => {
    setCenterIndex((i) => (i + dir + PLANS.length) % PLANS.length);
  }, []);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), AUTO_ADVANCE_MS);
  }, [advance]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const handleManual = (dir) => {
    advance(dir);
    resetTimer();
  };

  const leftIndex  = (centerIndex - 1 + PLANS.length) % PLANS.length;
  const rightIndex = (centerIndex + 1) % PLANS.length;

  const cardProps = (planIndex, slot) => ({
    plan: PLANS[planIndex],
    slot,
    isCurrent: currentPlan === PLANS[planIndex].id && subStatus === 'active',
    processing: processingPlan === PLANS[planIndex].id,
    onRazorpay, onStripe,
  });

  return (
    <div className="relative py-6">
      <button
        onClick={() => handleManual(-1)}
        aria-label="Previous plan"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-border items-center justify-center text-charcoal/60 hover:text-accent-600 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => handleManual(1)}
        aria-label="Next plan"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-border items-center justify-center text-charcoal/60 hover:text-accent-600 transition-colors"
      >
        <ChevronRight size={18} />
      </button>

      {/* Fixed 3-slot layout: left (small) — center (large) — right (small).
          Which PLAN sits in which slot changes; the slot positions themselves never move. */}
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <div className="hidden md:flex justify-end flex-1">
          <PlanCard key={`left-${PLANS[leftIndex].id}`} {...cardProps(leftIndex, 'side')} />
        </div>
        <div className="flex-shrink-0">
          <PlanCard key={`center-${PLANS[centerIndex].id}`} {...cardProps(centerIndex, 'center')} />
        </div>
        <div className="hidden md:flex justify-start flex-1">
          <PlanCard key={`right-${PLANS[rightIndex].id}`} {...cardProps(rightIndex, 'side')} />
        </div>
      </div>

      {/* Mobile: center card only, since side slots are hidden below md */}

      <div className="flex justify-center gap-1.5 mt-6">
        {PLANS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCenterIndex(i); resetTimer(); }}
            aria-label={`Show ${PLANS[i].name} in center`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === centerIndex ? 'w-6 bg-accent-500' : 'w-1.5 bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const { user } = useSelector((s) => s.auth);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    api.get('/subscriptions/transactions').then((r) => setTransactions(r.data.data.transactions)).finally(() => setTxLoading(false));
  }, []);

  const handleRazorpayPayment = async (planId) => {
    setProcessingPlan(planId);
    try {
      const { data } = await api.post('/subscriptions/razorpay/order', { plan: planId });
      const { orderId, amount, currency, key, txId } = data.data;

      const options = {
        key, amount, currency,
        name: 'ResQconnect',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Subscription`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/subscriptions/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              txId, plan: planId,
            });
            toast.success('Subscription activated');
            window.location.reload();
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#F20C63' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed'));
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to initiate payment');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleStripePayment = async (planId) => {
    setProcessingPlan(planId);
    try {
      const { data } = await api.post('/subscriptions/stripe/session', { plan: planId });
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setProcessingPlan(null);
    }
  };

  const sub = user?.subscription;
  const currentPlan = sub?.plan || 'free';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="
            absolute inset-0
            z-[-1]
            bg-[radial-gradient(circle_at_20%_20%,rgba(242,12,99,.15),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,123,176,.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,217,233,.5),transparent_15%)]  
            " />
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Subscription</h1>
        <p className="text-charcoal/60 text-sm mt-0.5">Choose a plan that keeps you safe</p>
      </div>

      {currentPlan !== 'free' && sub?.status === 'active' && (
        <div className="glass-card bg-green-50/60 border border-success-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle size={22} className="text-success-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-success-500 capitalize">{currentPlan} Plan - Active</p>
              {sub.endDate && (
                <p className="text-sm text-success-500/80">
                  Renews {formatDistanceToNow(new Date(sub.endDate), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <PlanCarousel
        currentPlan={currentPlan}
        subStatus={sub?.status}
        processingPlan={processingPlan}
        onRazorpay={handleRazorpayPayment}
        onStripe={handleStripePayment}
      />

      <div className="glass-card">
        <h2 className="font-display font-semibold text-lg text-charcoal mb-4 flex items-center gap-2">
          <Receipt size={20} className="text-accent-500" /> Transaction History
        </h2>
        {txLoading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-12 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-charcoal/40 text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-charcoal/80">{tx.description || tx.type}</p>
                  <p className="text-xs text-charcoal/50">{new Date(tx.createdAt).toLocaleDateString()} - {tx.gateway}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-charcoal">{tx.currency} {tx.amount.toFixed(2)}</p>
                  <span className={`badge text-xs ${tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-warn' : 'badge-error'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}