import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Users, Shield, Star, Heart, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThreePillarProps {
  projectedAge: number;
  userCountry: string;
}

export default function ThreePillarLongevityDashboard({ projectedAge, userCountry }: ThreePillarProps) {
  const [activeTab, setActiveTab] = useState<'heritage' | 'community' | 'celebrity'>('heritage');
  const [localAnchorHabit, setLocalAnchorHabit] = useState('social');

  // Comprehensive Aspirational Celebrity Array
  const celebrityDatabase = [
    { name: "Amitabh Bachchan", age: 83, status: "Living", type: "Bollywood Icon", note: "Renowned for strict discipline, zero smoking/drinking, and active work habits deep into his 80s.", region: "Domestic" },
    { name: "Lata Mangeshkar", age: 92, status: "Deceased", type: "Legendary Vocalist", note: "Maintained incredible neuro-vocal resilience and continuous cognitive engagement throughout a long life.", region: "Domestic" },
    { name: "Milind Soman", age: 60, status: "Living", type: "Fitness Pioneer", note: "Advocate for barefoot running, minimal processed foods, and core functional training.", region: "Domestic" },
    { name: "Ratan Tata", age: 86, status: "Deceased", type: "Industrialist", note: "Demonstrated how strong purpose, philanthropy, and lifelong service correlate with extended cognitive vitality.", region: "Domestic" },
    { name: "Field Marshal Sam Manekshaw", age: 94, status: "Deceased", type: "Military Leader", note: "High mental resilience and structured routine contributed to robust lifelong health.", region: "Domestic" },
    { name: "Dharmendra", age: 90, status: "Living", type: "Cinema Veteran", note: "Emphasizes natural organic farming, outdoor movement, and simple living.", region: "Domestic" },
    { name: "David Sinclair", age: 57, status: "Living", type: "Longevity Scientist", note: "Harvard geneticist practicing NMN supplementation, intermittent fasting, and biological aging tracking.", region: "International" },
    { name: "Queen Elizabeth II", age: 96, status: "Deceased", type: "Monarch", note: "Lifelong light-moderate activity, strong daily routines, and sharp executive function.", region: "International" },
    { name: "Bryan Johnson", age: 48, status: "Living", type: "Project Blueprint Founder", note: "Pioneering intensive biological optimization protocols to reverse cellular aging.", region: "International" }
  ];

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase">Interactive Perspective Engine</span>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              The Three Pillars of Your Longevity Blueprint
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-slate-400 hover:text-slate-600 p-1"><Info className="w-4 h-4" /></button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-slate-900 text-white p-2 text-xs">
                This engine balances your genetic roots, immediate environment, and target aspirations to build a holistic life trajectory.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      {/* Tabs Layout */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => setActiveTab('heritage')} className={`py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'heritage' ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-800 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40'}`}>
          1. Heritage Tree
        </button>
        <button onClick={() => setActiveTab('community')} className={`py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'community' ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-800 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40'}`}>
          2. Local Anchor Context
        </button>
        <button onClick={() => setActiveTab('celebrity')} className={`py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'celebrity' ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-800 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40'}`}>
          3. Celebrity Blueprints
        </button>
      </div>

      <CardContent className="p-6">
        {/* PILLAR 1: HERITAGE TREE */}
        {activeTab === 'heritage' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start gap-2">
              <Shield className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-700 dark:text-slate-400 leading-normal">
                <strong>Important Note on Lineage:</strong> If an ancestor has passed away, please input their exact <strong>age at passing</strong>. If they are currently living, input their current age. This establishes your genetic baseline accurately.
              </p>
            </div>
            <p className="text-xs text-slate-500 italic text-center">
              (Use the age input cards below to add grandparents, aunts, and uncles to recalculate your genetic baseline.)
            </p>
          </div>
        )}

        {/* PILLAR 2: LOCAL ANCHOR CONTEXT */}
        {activeTab === 'community' && (
          <div className="grid md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-2 space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Local Longevity Anchor</h4>
              
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Identifier / Name</label>
                <input type="text" defaultValue="Mishra Uncle" className="w-full text-xs p-2 rounded-md border border-slate-200 bg-slate-50/50 dark:bg-slate-900" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Achieved Age</label>
                <input type="number" defaultValue={96} className="w-full text-xs p-2 rounded-md border border-slate-200 bg-slate-50/50 dark:bg-slate-900" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Primary Epigenetic Habit</label>
                <select value={localAnchorHabit} onChange={(e) => setLocalAnchorHabit(e.target.value)} className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white dark:bg-slate-900">
                  <option value="social">Daily Peer Social Cohesion (Clubs/Societies)</option>
                  <option value="laughter">Therapeutic Humor Protocol (Laughter Club)</option>
                  <option value="walking">Active Daily Walking (10k+ Steps Framework)</option>
                  <option value="yoga">Daily Yoga & Pranayama Protocol</option>
                  <option value="nosmoke">Strict Abstinence (Zero Smoking/Drinking)</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-3 p-5 rounded-xl border border-teal-100 bg-teal-50/30 dark:bg-teal-950/10 space-y-3">
              <div className="flex items-center gap-2 text-teal-800 dark:text-teal-400 font-semibold text-sm">
                <Activity className="w-4 h-4 text-teal-600" />
                Conquering Local Stressors via Epigenetics
              </div>
              
              {/* Conditional Data Blocks with clinical phrasing */}
              {localAnchorHabit === 'social' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Social Cohesion Index Optimization:</strong> Meeting peers daily down-regulates the CTRA gene transcription network, suppressing systemic cellular inflammation.
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                    🔬 <strong>WHO Research Context:</strong> Sustained community integration suppresses chronic biological isolation, adding strong neurological security corresponding to extended lifespans.
                  </div>
                </div>
              )}

              {localAnchorHabit === 'laughter' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Therapeutic Humor Protocol:</strong> Group-based vocal laughter triggers immediate vagal nerve stimulation, dropping arterial cortisol levels and expanding endothelial dilation.
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                    🌎 <strong>Global Validation:</strong> Originating in domestic parks and now adopted by wellness centers globally, structured laughter groups provide rapid oxygenation and metabolic benefits.
                  </div>
                </div>
              )}

              {localAnchorHabit === 'walking' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Cardiorespiratory Maintenance:</strong> Rhythmic steady-state aerobic movement directly improves myocardial compliance and sustains left ventricular elasticity over time.
                  </p>
                </div>
              )}

              {localAnchorHabit === 'yoga' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Autonomic Nervous System Balancing:</strong> Deep pranayama creates an ideal shift from sympathetic drive to parasympathetic dominance, protecting resting heart rate metrics.
                  </p>
                </div>
              )}

              {localAnchorHabit === 'nosmoke' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Toxin Clearance Control:</strong> Total elimination of particulate matter and chemical mutagens shields genetic base pairs from cellular damage and early mutations.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PILLAR 3: CELEBRITY BLUEPRINTS */}
        {activeTab === 'celebrity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Map your current projected target trajectory (<span className="font-bold text-teal-600">{projectedAge.toFixed(1)} yrs</span>) against elite biological benchmarks.
              </p>
              <Badge variant="outline" className="text-[10px] bg-slate-50">Aspirational Cohort Loaded</Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {celebrityDatabase.map((cel, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h5 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                        {cel.name}
                        {cel.region === 'International' && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                      </h5>
                      <span className="text-[10px] text-slate-400">{cel.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{cel.age} yrs</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${cel.status === 'Living' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                        {cel.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100/60">{cel.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}