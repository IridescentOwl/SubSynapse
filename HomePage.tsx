import React, { useState, useEffect, useRef } from 'react';
import GlassmorphicCard from './components/GlassmorphicCard.tsx';
import Icon from './components/Icon.tsx';
import type { IconName } from './types.ts';

interface HomePageProps {
  onLogin: () => void;
  isReady: boolean;
}

const featuredServices: IconName[] = ['netflix', 'spotify', 'youtube', 'hbo', 'chatgpt', 'swiggy', 'zomato', 'applemusic', 'claude', 'adobe', 'canva', 'disney', 'office'];

const testimonials = [
    { quote: "SubSynapse is a game-changer! I'm saving over $50 a month without sacrificing any of my favorite shows or music. Highly recommend!", author: "Sarah J." },
    { quote: "I was skeptical at first, but the process was so smooth and secure. I joined a Spotify Family plan in minutes. The UI is just beautiful!", author: "Mike R." },
    { quote: "Finally, a smart way to handle subscriptions. It's brilliant. I've invited all my friends to create our own shared groups for everything.", author: "Alex C." },
];


const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <GlassmorphicCard className="overflow-hidden group-hover:opacity-60 group-hover:scale-95 hover:!opacity-100 hover:!scale-100 transition-all duration-300">
            <button
                className="w-full flex justify-between items-center text-left p-6 hover:bg-white/5 transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-semibold text-white pr-4">{question}</span>
                <div className="flex-shrink-0">
                  <svg
                      className={`w-6 h-6 text-sky-300 transform transition-all duration-300 ${isOpen ? 'rotate-180 text-sky-200' : 'hover:text-sky-200'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-6 pb-6 text-slate-300 leading-relaxed border-t border-white/10 pt-4 mt-2">
                    {answer}
                </div>
            </div>
        </GlassmorphicCard>
    );
};

const SavingsIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glass-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
        </defs>
        <path d="M36 21.3333C36 19.4924 34.5076 18 32.6667 18H28C25.7909 18 24 19.7909 24 22C24 24.2091 25.7909 26 28 26H32C34.2091 26 36 27.7909 36 30C36 32.2091 34.2091 34 32 34H27.3333C25.4924 34 24 35.4924 24 37.3333C24 39.1742 25.4924 40.6667 27.3333 40.6667H32M32 12V18M32 40.6667V46" stroke="white" strokeWidth="4" strokeLinecap="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
        <path d="M36 21.3333C36 19.4924 34.5076 18 32.6667 18H28C25.7909 18 24 19.7909 24 22C24 24.2091 25.7909 26 28 26H32C34.2091 26 36 27.7909 36 30C36 32.2091 34.2091 34 32 34H27.3333C25.4924 34 24 35.4924 24 37.3333C24 39.1742 25.4924 40.6667 27.3333 40.6667H32M32 12V18M32 40.6667V46" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

const AccessIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glass-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
        </defs>
        <g transform="rotate(45 32 32)">
            <path d="M22 42L32 32L42 42M32 22V42" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
            <path d="M32 12C32 12 38 18 38 28C38 34.6274 32 42 32 42C32 42 26 34.6274 26 28C26 18 32 12 32 12Z" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
            <path d="M22 42L32 32L42 42M32 22V42" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 12C32 12 38 18 38 28C38 34.6274 32 42 32 42C32 42 26 34.6274 26 28C26 18 32 12 32 12Z" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>
);

const SecureIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glass-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
        </defs>
        <path d="M32 12L16 20V34C16 43.9411 22.9118 52.1176 32 56C41.0882 52.1176 48 43.9411 48 34V20L32 12Z" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
        <path d="M32 12L16 20V34C16 43.9411 22.9118 52.1176 32 56C41.0882 52.1176 48 43.9411 48 34V20L32 12Z" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CommunityIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glass-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
        </defs>
        <path d="M26 48V44C26 40.6863 28.6863 38 32 38H40C43.3137 38 46 40.6863 46 44V48" stroke="white" strokeWidth="4" strokeLinecap="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
        <path d="M36 30C38.2091 30 40 28.2091 40 26C40 23.7909 38.2091 22 36 22C33.7909 22 32 23.7909 32 26C32 28.2091 33.7909 30 36 30Z" stroke="white" strokeWidth="4" strokeLinecap="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
        <path d="M22 38V34C22 31.2386 24.2386 29 27 29H28" stroke="white" strokeWidth="4" strokeLinecap="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
        <path d="M24 21C26.2091 21 28 19.2091 28 17C28 14.7909 26.2091 13 24 13C21.7909 13 20 14.7909 20 17C20 19.2091 21.7909 21 24 21Z" stroke="white" strokeWidth="4" strokeLinecap="round" filter="url(#glass-blur)" strokeOpacity="0.3"/>
        <path d="M26 48V44C26 40.6863 28.6863 38 32 38H40C43.3137 38 46 40.6863 46 44V48" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M36 30C38.2091 30 40 28.2091 40 26C40 23.7909 38.2091 22 36 22C33.7909 22 32 23.7909 32 26C32 28.2091 33.7909 30 36 30Z" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 38V34C22 31.2386 24.2386 29 27 29H28" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M24 21C26.2091 21 28 19.2091 28 17C28 14.7909 26.2091 13 24 13C21.7909 13 20 14.7909 20 17C20 19.2091 21.7909 21 24 21Z" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

const howItWorksSteps = [
    { number: 1, title: 'Discover', description: 'Browse a vast marketplace of subscription groups for services like Netflix, Spotify, and more.' },
    { number: 2, title: 'Join', description: 'Find a group that fits your needs and securely join with just a few clicks. Your slot is guaranteed.' },
    { number: 3, title: 'Save', description: 'Enjoy premium services at a fraction of the price. We handle the payments, you just relax and save.' }
];

const whyChooseUsFeatures = [
    { icon: <SavingsIcon />, title: "Massive Savings", description: "Keep more money in your pocket. Our members save up to 80% on their monthly subscription bills." },
    { icon: <AccessIcon />, title: "Access Everything", description: "Don't choose between services. Our model makes it affordable to get everything you want." },
    { icon: <SecureIcon />, title: "Simple & Secure", description: "We use industry-leading security for payments and data. Your privacy is our priority." },
    { icon: <CommunityIcon />, title: "Community Focused", description: "Join a community of savvy savers. Create your own groups with friends or join public ones." }
];

const HomePage: React.FC<HomePageProps> = ({ onLogin, isReady }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLElement>(null);

  // Counter animation function
  const animateCounter = (element: HTMLElement, target: number, prefix = '', suffix = '') => {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      if (prefix === '₹') {
        element.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
      } else {
        element.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
      }
    }, 20);
  };

  // Intersection Observer for counter animation
  useEffect(() => {
    if (!isReady || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach((counter) => {
              const target = parseInt(counter.getAttribute('data-target') || '0');
              const text = counter.textContent || '';
              
              if (text.includes('₹')) {
                if (target === 34000) {
                  animateCounter(counter as HTMLElement, 34, '₹', 'K');
                } else {
                  animateCounter(counter as HTMLElement, target, '₹', '');
                }
              } else if (text.includes('%')) {
                animateCounter(counter as HTMLElement, target, '', '%');
              } else if (text.includes('+')) {
                if (target === 12000) {
                  animateCounter(counter as HTMLElement, 12, '', 'K+');
                } else {
                  animateCounter(counter as HTMLElement, target, '', '+');
                }
              } else {
                animateCounter(counter as HTMLElement, target, '', '');
              }
            });
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [isReady, hasAnimated]);

  return (
    <main className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className={`text-5xl md:text-7xl font-bold text-shadow bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-blue-400 to-purple-400 mb-6 transition-all duration-1200 ease-out delay-[400ms] gpu-accelerated ${isReady ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
          Share Subscriptions, <br /> Split Costs.
        </h1>
        <p className={`text-lg md:text-xl text-slate-300 mb-6 max-w-3xl mx-auto transition-all duration-1000 ease-out delay-[700ms] ${isReady ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-98'}`}>
          Welcome to SubSynapse, the future of subscription management. Effortlessly join groups, share your favorite services, and save hundreds every year.
        </p>

        <button
          onClick={onLogin}
          className={`btn-primary text-white font-bold py-4 px-10 rounded-full text-lg delay-[1200ms] relative overflow-hidden group ${isReady ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}
        >
          <span className="relative z-10">Explore Groups & Start Saving</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
        </button>
      </section>

      {/* Statistics Section */}
      <section ref={statsRef} className={`py-6 transition-all duration-1000 ease-out delay-[700ms] ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter" data-target="2847">₹0</div>
                  <div className="text-slate-300 text-sm">Average Monthly Savings</div>
                </GlassmorphicCard>
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter" data-target="73">0%</div>
                  <div className="text-slate-300 text-sm">Cost Reduction</div>
                </GlassmorphicCard>
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter" data-target="12000">0</div>
                  <div className="text-slate-300 text-sm">Active Members</div>
                </GlassmorphicCard>
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter" data-target="34000">₹0</div>
                  <div className="text-slate-300 text-sm">Annual Savings</div>
                </GlassmorphicCard>
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 counter" data-target="15">0+</div>
                  <div className="text-slate-300 text-sm">Services Available</div>
                </GlassmorphicCard>
              </div>
          </div>
      </section>
      
      {/* Scrolling Services */}
      <section className={`pt-2 pb-8 transition-all duration-1000 ease-out delay-[1000ms] ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-32"></div>
              <span className="text-slate-400 text-sm font-medium">Available Services</span>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-32"></div>
            </div>
          </div>
          <div className="scroller-fade overflow-hidden">
              <div className="flex w-max gap-x-12 animate-scroll-left-fast gpu-accelerated">
                {[...featuredServices, ...featuredServices].map((service, index) => (
                    <div key={`${service}-${index}`} className="flex-shrink-0 p-3 transition-enhanced hover:scale-110">
                      <Icon name={service} className="w-12 h-12 md:w-16 md:h-16 opacity-80 hover:opacity-100 transition-opacity duration-300" />
                    </div>
                ))}
              </div>
          </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 text-shadow transition-all duration-1000 ease-out delay-[1500ms] ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>A New Way to Subscribe</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center group pointer-events-none">
          {howItWorksSteps.map((step, index) => (
            <GlassmorphicCard 
              key={step.number}
              className="p-8 group-hover:opacity-60 group-hover:scale-95 hover:!opacity-100 hover:!scale-100 hover:!-translate-y-2"
              hasAnimation={true}
              isReady={isReady}
              animationDelay={1700 + index * 200}
            >
              <div className="text-6xl mb-4 text-sky-400 font-bold">{step.number}</div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-300">{step.description}</p>
            </GlassmorphicCard>
          ))}
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-16">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 text-shadow transition-all duration-1000 ease-out delay-[2500ms] ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>Why You'll Love SubSynapse</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 group pointer-events-none">
            {whyChooseUsFeatures.map((feature, index) => (
              <GlassmorphicCard 
                key={feature.title}
                className="p-6 text-center group-hover:opacity-60 group-hover:scale-95 hover:!opacity-100 hover:!scale-100 hover:!-translate-y-2"
                hasAnimation={true}
                isReady={isReady}
                animationDelay={2700 + index * 180}
              >
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
              </GlassmorphicCard>
            ))}
          </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 text-shadow transition-all duration-1000 ease-out delay-[3500ms] ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>Loved by Users Worldwide</h2>
          <div className="scroller-fade overflow-hidden">
              <div className="flex w-max gap-8 animate-scroll-left-slow py-4">
                  {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                      <GlassmorphicCard key={index} className="p-8 w-[350px] md:w-[400px] flex-shrink-0 group hover:scale-105 transition-all duration-300">
                          <div className="relative">
                            <svg className="absolute -top-2 -left-2 w-8 h-8 text-sky-400/30" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                            </svg>
                            <p className="text-slate-200 mb-4 text-lg leading-relaxed pl-6">"{testimonial.quote}"</p>
                            <p className="font-bold text-sky-300 text-right transition-colors group-hover:text-sky-200">- {testimonial.author}</p>
                          </div>
                      </GlassmorphicCard>
                  ))}
              </div>
          </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 max-w-3xl mx-auto">
           <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 text-shadow transition-all duration-1000 ease-out delay-[4000ms] ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>Frequently Asked Questions</h2>
           <div className="space-y-4 group pointer-events-none">
               <FaqItem
                    question="Is subscription sharing legal and safe?"
                    answer="Absolutely. Subscription sharing within a household or per the service's terms is common practice. SubSynapse provides a platform to manage payments between group members securely, ensuring everyone pays their fair share without you having to chase them down."
               />
               <FaqItem
                    question="How are payments handled?"
                    answer="We use a secure, encrypted payment processor to handle all transactions. When you join a group, your payment is held securely and transferred to the group owner on the renewal date. This ensures both parties are protected."
                />
                <FaqItem
                    question="What happens if someone leaves a group?"
                    answer="If a member leaves, their spot opens up for a new member to join. Group owners are notified, and the spot is listed back on the SubSynapse marketplace. There's no interruption for the remaining members."
                />
                 <FaqItem
                    question="Can I create and manage my own group?"
                    answer="Yes! If you are the owner of a family or group subscription plan, you can list your vacant slots on SubSynapse. You can set your group to be public or private (invite-only), making it easy to share with friends or the community."
                />
           </div>
      </section>
      
      {/* Final CTA */}
      <section className="text-center py-20">
          <h2 className="text-4xl md:text-5xl font-bold text-shadow mb-6">Ready to Start Saving?</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Join thousands of users who are cutting their subscription costs. Explore open groups or create your own today.</p>
           <button
             onClick={onLogin}
             className="btn-primary text-white font-bold py-4 px-10 rounded-full text-lg relative overflow-hidden group"
           >
             <span className="relative z-10 flex items-center justify-center gap-2">
               Get Started For Free
               <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
               </svg>
             </span>
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
           </button>
      </section>
      
      <style>{`
        @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-scroll-left-fast {
            animation: scroll-left 60s linear infinite;
        }
        .animate-scroll-left-slow {
            animation: scroll-left 120s linear infinite;
        }
        .scroller-fade {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </main>
  );
};

export default HomePage;