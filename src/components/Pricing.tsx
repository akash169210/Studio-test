import React, { useState } from 'react';

const plans = [
  {
    name: 'Basic',
    price: '$29',
    yearlyPrice: '$24',
    subtitle: 'For solo entrepreneurs',
    features: [
      'Everything in Basic',
      'Card rates from 2.9% + 30¢ USD',
      "World's best checkout",
      'Built-in AI tools',
      'Earn up to $5,000 in credits'
    ]
  },
  {
    name: 'Grow',
    price: '$79',
    yearlyPrice: '$69',
    subtitle: 'For small teams',
    features: [
      'Everything in Basic',
      'Card rates from 2.7% + 30¢ USD',
      'Up to 87% off shipping',
      'Up to 5 staff accounts',
      'Earn up to $7,500 in credits'
    ],
    popular: true
  },
  {
    name: 'Advanced',
    price: '$299',
    yearlyPrice: '$249',
    subtitle: 'For global reach',
    features: [
      'Everything in Grow',
      'Card rates from 2.5% + 30¢ USD',
      'Live 3rd-party shipping rates',
      'Up to 15 staff accounts',
      'Tailor your store by region',
      'Earn up to $10,000 in credits'
    ]
  },
  {
    name: 'Plus',
    price: '$2,300',
    yearlyPrice: '$2,000',
    prefix: 'from',
    subtitle: 'For complex businesses',
    features: [
      'Everything in Advanced',
      'Card rates from 2.25% + 30¢ USD',
      'Fully customizable checkout',
      'Unlimited staff accounts',
      'Up to 200 POS Pro locations',
      'Unlimited B2B catalogs'
    ]
  }
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="max-w-[1400px] mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          You've got plans. Us too.
        </h2>
        <p className="text-[22px] text-white/90 mb-10 font-medium">
          Try 3 days free, then $1/month for 3 months.
        </p>
        
        <div className="max-w-md mx-auto relative mb-16">
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="w-full pl-6 pr-36 py-4 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#95BF47] text-[15px]"
          />
          <button className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-black text-white font-bold hover:bg-gray-900 transition-colors text-[15px]">
            Start free trial
          </button>
          <p className="text-[13px] text-gray-400 mt-4">
            By entering your email, you agree to receive marketing emails from SDR Agent.
          </p>
        </div>

        <div className="flex items-center justify-between max-w-5xl mx-auto mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isYearly ? 'bg-[#95BF47]' : 'bg-white/20'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-[15px] font-bold">Pay yearly</span>
          </div>
          <a href="#" className="text-[15px] font-bold underline underline-offset-4 hover:text-gray-300">
            Compare all features
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-[#1a1a1a] rounded-3xl p-8 border transition-colors relative ${plan.popular ? 'border-[#95BF47]' : 'border-white/5 hover:border-white/10'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-8 bg-[#95BF47] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-[15px] text-gray-400">{plan.subtitle}</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                {plan.prefix && <span className="text-[15px] text-gray-400">{plan.prefix}</span>}
                <span className="text-4xl font-bold">{isYearly ? plan.yearlyPrice : plan.price}</span>
                <span className="text-[15px] text-gray-400">/mo</span>
              </div>
              <p className="text-[13px] text-gray-400 mt-2">
                {isYearly ? 'Billed annually' : 'Billed monthly'}
              </p>
            </div>
            
            <button className={`w-full py-3 rounded-full font-bold text-[15px] transition-colors mb-8 ${plan.popular ? 'bg-[#95BF47] text-black hover:bg-[#85ab3f]' : 'bg-white text-black hover:bg-gray-100'}`}>
              Start free trial
            </button>
            
            <ul className="space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="text-[15px] text-gray-300 flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#95BF47] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
