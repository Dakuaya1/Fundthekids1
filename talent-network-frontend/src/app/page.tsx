'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, School, Heart, ShieldCheck, Globe, Star, Users, Loader2, MapPin, Award } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import AboutCreator from '@/components/AboutCreator';

interface Child {
  id: string;
  name: string;
  talentCategory: string;
  city: string;
  mediaUrls: string[];
  ngo: { name: string; region: string };
}
interface NGO {
  id: string;
  name: string;
  region: string;
  _count: { children: number };
}
interface Volunteer {
  id: string;
  user: { email: string };
  region: string;
  impactScore: number;
}
interface Sponsor {
  id: string;
  user: { email: string };
  impactScore: number;
}

interface ShowcaseData {
  children: Child[];
  ngos: NGO[];
  volunteers: Volunteer[];
  sponsors: Sponsor[];
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [showcase, setShowcase] = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const res = await api.get('/showcase');
        setShowcase(res.data);
      } catch (error) {
        console.error('Failed to fetch showcase data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShowcase();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const featuredChildren = showcase?.children.length ?? 0;
  const featuredNgos = showcase?.ngos.length ?? 0;
  const featuredVolunteers = showcase?.volunteers.length ?? 0;
  const featuredSponsors = showcase?.sponsors.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-200 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/50 dark:bg-blue-900/20 animate-float" style={{ animationDuration: '15s' }}></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 animate-float" style={{ animationDuration: '18s', animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-0 w-full z-50 px-6 py-6"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center glass px-6 py-4 rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              Talent Network
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-6">
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 rounded-full font-semibold transition-all shadow-md flex items-center group gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors">Sign In</Link>
                <Link href="/register" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-semibold transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5">Join the Network</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pb-24 pt-36 lg:pb-28 lg:pt-44">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 px-5 py-2.5 text-sm font-semibold text-blue-800 shadow-sm glass dark:border-blue-700/50 dark:text-blue-200">
              <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
              <span>Verified discovery for exceptional children</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="mt-8 max-w-5xl text-6xl font-black leading-[0.98] tracking-[-0.04em] text-slate-900 dark:text-white md:text-7xl xl:text-[6.6rem]">
              We find prodigy children
              <span className="block bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                who need your support the most.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-8 max-w-3xl text-xl leading-9 text-slate-600 dark:text-slate-300 md:text-2xl">
              Talent Network identifies extraordinary kids through verified NGOs, surfaces their strongest gifts, and helps sponsors fund the children with the highest upside and the greatest urgency.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href={isAuthenticated ? "/dashboard" : "/register"} className="primary-button w-full gap-3 px-8 py-4 text-lg sm:w-auto">
                Start Supporting
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/explore" className="secondary-button w-full gap-3 px-8 py-4 text-lg sm:w-auto dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800">
                Explore Prodigy Profiles
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="glass-card panel-outline rounded-[1.8rem] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Verified Children</p>
                <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">{featuredChildren}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Live profiles currently featured for support.</p>
              </div>
              <div className="glass-card panel-outline rounded-[1.8rem] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Field Pipeline</p>
                <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">{featuredNgos + featuredVolunteers}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">NGOs and volunteers validating talent in the field.</p>
              </div>
              <div className="glass-card panel-outline rounded-[1.8rem] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Sponsor Momentum</p>
                <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">{featuredSponsors}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Active supporters already visible in the network.</p>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="relative">
            <div className="glass-card panel-outline relative overflow-hidden rounded-[2.5rem] p-6 shadow-2xl shadow-blue-500/10">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between rounded-[1.6rem] border border-white/20 bg-slate-950 px-5 py-4 text-white shadow-xl">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Priority Lens</p>
                    <p className="mt-2 text-2xl font-black">High-potential. High-need.</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Heart className="h-7 w-7 text-cyan-300" />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    'NGOs nominate children showing rare academic, artistic, athletic, or technical ability.',
                    'Volunteer verification strengthens trust before sponsors commit meaningful support.',
                    'The platform spotlights the children whose potential is highest and whose resources are thinnest.',
                  ].map((point) => (
                    <div key={point} className="flex gap-3 rounded-[1.4rem] border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                      <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                      <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{point}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">Why this matters</p>
                    <p className="mt-3 text-lg font-semibold leading-8">Prodigy is often found in places where support is missing. That gap is the problem this platform is built to close.</p>
                  </div>
                  <div className="rounded-[1.6rem] border border-slate-200/70 bg-white/80 p-5 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Decision support</p>
                    <p className="mt-3 text-lg font-semibold leading-8 text-slate-900 dark:text-white">Sponsors don&apos;t just donate blindly. They back visible talent with verified context.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 px-4 pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div className="glass-card panel-outline rounded-[2rem] p-8 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">How the platform works</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">A sharper pipeline for discovering rare talent early.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-[1.7rem] bg-white/70 p-5 dark:bg-slate-900/60">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                  <School className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nominate</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">Partner NGOs surface children whose ability stands far above their local access to opportunity.</p>
              </div>
              <div className="rounded-[1.7rem] bg-white/70 p-5 dark:bg-slate-900/60">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verify</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">Field volunteers confirm progress, context, and legitimacy so support can move with confidence.</p>
              </div>
              <div className="rounded-[1.7rem] bg-white/70 p-5 dark:bg-slate-900/60">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fund</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">Sponsors direct money to the children where intervention can change the trajectory the most.</p>
              </div>
            </div>
          </div>

          <div className="glass-card panel-outline rounded-[2rem] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Platform thesis</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Talent should never be invisible because poverty is loud.</h2>
            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-400">
              This is not generic charity discovery. It is a focused support network for prodigy children who have rare ability and urgent need.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Showcases */}
      <section className="py-20 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-500 font-medium">Loading platform showcases...</p>
            </div>
          ) : showcase ? (
            <div className="space-y-32">

              {/* Children Showcase */}
              {showcase.children.length > 0 && (
                <div>
                  <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Prodigy spotlight</p>
                      <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">Children whose upside is exceptional and whose support gap is immediate.</h2>
                      <p className="mt-4 text-xl font-light text-slate-600 dark:text-slate-400">Each profile below is part of a verified pipeline designed to surface rare ability before it is lost to circumstance.</p>
                    </div>
                    <Link href="/explore" className="secondary-button w-full justify-center gap-3 sm:w-auto dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800">
                      View Full Talent Gallery
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="glass-card panel-outline rounded-[2.4rem] p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">What makes this different</p>
                      <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Not every need is equal. Not every gift is ordinary.</h3>
                      <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-400">
                        This platform prioritizes children whose potential is clearly visible, whose progress can be tracked, and whose opportunity depends on someone stepping in early.
                      </p>
                      <div className="mt-8 space-y-4">
                        {[
                          ['Verified talent signals', 'Academic, artistic, athletic, and technical strengths are surfaced through partner institutions.'],
                          ['Context before funding', 'Sponsors see where a child is from, which NGO vouched for them, and why support matters now.'],
                          ['Ongoing proof of progress', 'Field updates keep the relationship grounded in evidence, not vague promises.'],
                        ].map(([title, text]) => (
                          <div key={title} className="rounded-[1.4rem] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {showcase.children.map((child, index) => (
                        <div key={child.id} className={`glass-card panel-outline rounded-[2rem] p-6 transition-transform duration-300 hover:-translate-y-2 ${index === 0 ? 'md:col-span-2 md:grid md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-6' : ''}`}>
                          {child.mediaUrls && child.mediaUrls.length > 0 ? (
                            <div className={`relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-800 ${index === 0 ? 'min-h-[18rem] aspect-[4/3] md:h-full md:aspect-auto' : 'aspect-square'}`}>
                              <Image src={child.mediaUrls[0]} alt={child.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className={`mb-4 flex items-center justify-center rounded-[1.6rem] border border-blue-200/50 bg-gradient-to-br from-blue-100 to-indigo-50 dark:border-blue-800/50 dark:from-blue-900/40 dark:to-indigo-900/20 ${index === 0 ? 'min-h-[18rem] aspect-[4/3] md:mb-0 md:h-full md:aspect-auto' : 'aspect-square'}`}>
                              <Star className="h-16 w-16 text-blue-300 dark:text-blue-700/50" />
                            </div>
                          )}
                          <div className={index === 0 ? 'mt-6 md:mt-0' : 'mt-4'}>
                            <div className="flex items-center justify-between gap-3">
                              <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                {child.talentCategory}
                              </span>
                              {index === 0 ? (
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Featured priority</span>
                              ) : null}
                            </div>
                            <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{child.name}</h3>
                            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {child.city || 'Undisclosed'}, {child.ngo.region}</p>
                              <p className="flex items-center gap-2"><School className="w-4 h-4" /> Verified via {child.ngo.name}</p>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                              A rare strength has already been identified here. What is missing is sustained backing early enough to convert promise into trajectory.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Ecosystem Metrics Grid */}
              <div className="grid lg:grid-cols-3 gap-8">

                {/* NGOs */}
                <div className="glass-card rounded-[2.5rem] p-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                    <School className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Featured NGOs</h3>
                  <div className="space-y-4">
                    {showcase.ngos.map(ngo => (
                      <div key={ngo.id} className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{ngo.name}</p>
                          <p className="text-sm text-slate-500">{ngo.region}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{ngo._count.children}</span>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Kids</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volunteers */}
                <div className="glass-card rounded-[2.5rem] p-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Top Volunteers</h3>
                  <div className="space-y-4">
                    {showcase.volunteers.map((vol, i) => (
                      <div key={vol.id} className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">#{i + 1}</div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{vol.user.email.split('@')[0]}</p>
                            <p className="text-sm text-slate-500">{vol.region}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2 text-amber-500">
                          <span className="font-bold">{vol.impactScore}</span>
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sponsors */}
                <div className="glass-card rounded-[2.5rem] p-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Leading Sponsors</h3>
                  <div className="space-y-4">
                    {showcase.sponsors.map((sponsor, i) => (
                      <div key={sponsor.id} className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">#{i + 1}</div>
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{sponsor.user.email.split('@')[0]}</p>
                        </div>
                        <div className="text-right flex items-center gap-2 text-amber-500">
                          <span className="font-bold">{sponsor.impactScore}</span>
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Trust & CTA */}
      <section className="py-32 px-4 text-center relative z-10">
        <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-900/10 slant-y-3"></div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-5xl mx-auto relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-slate-800 p-16 rounded-[3rem] shadow-2xl">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Call to action</p>
          <h2 className="mt-5 text-4xl md:text-6xl font-black mb-8 tracking-tight text-slate-900 dark:text-white">Back the children whose gifts are too rare to leave unsupported.</h2>
          <p className="text-2xl text-slate-600 dark:text-slate-400 mb-12 font-light max-w-3xl mx-auto">Join a platform built to find prodigy children early, verify their context, and make sure the most urgent potential gets funded before it fades.</p>
          <Link href="/register" className="inline-flex px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl shadow-blue-500/25">
            Create Free Account
          </Link>
        </motion.div>
      </section>

      <section className="relative z-10 px-4 pb-20">
        <div className="mx-auto flex max-w-7xl justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <AboutCreator />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 text-center relative z-10 glass">
        <p suppressHydrationWarning className="text-slate-500 font-medium flex items-center justify-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Talent Infrastructure Network &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
