import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Check, ArrowRight, Zap, Coins, Brain, Flame, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';
import { useGame } from '../../context/GameContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function GameMasterChat({ onQuestAccepted }) {
  const { character } = useAuth();
  const { fetchQuests } = useGame();

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Greetings, Adventurer! I am your AI Game Master and RPG Coach. I observe your real-world feats, analyze your attributes, and adapt your challenges. What quest shall we forge today?`,
      questProposal: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [coachInsights, setCoachInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [acceptingQuestId, setAcceptingQuestId] = useState(null);
  const [planAccepted, setPlanAccepted] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load Coach Insights on mount
  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const data = await api.getCoachInsights();
      setCoachInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const res = await api.chatGameMaster(text);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          questProposal: res.suggestedQuest || null
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'The celestial link wavered: ' + (err.message || 'Please summon me once more.')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Accept single suggested quest
  const handleAcceptQuest = async (questProposal, msgIndex) => {
    if (acceptingQuestId !== null) return;
    setAcceptingQuestId(msgIndex);

    try {
      const res = await api.createQuest({
        title: questProposal.title,
        description: questProposal.description,
        category: questProposal.category,
        difficulty: questProposal.difficulty
      });

      await fetchQuests();
      if (onQuestAccepted) onQuestAccepted(res.task);

      // Update message state to show accepted
      setMessages(prev => prev.map((m, idx) => idx === msgIndex ? { ...m, isAccepted: true } : m));
    } catch (err) {
      console.error('Accept quest failed:', err);
    } finally {
      setAcceptingQuestId(null);
    }
  };

  // Accept AI Plan
  const handleAcceptPlan = async () => {
    if (!coachInsights?.suggestedPlan || planAccepted) return;
    setLoadingInsights(true);
    try {
      await api.acceptAiPlan(coachInsights.suggestedPlan);
      await fetchQuests();
      setPlanAccepted(true);
      if (onQuestAccepted) onQuestAccepted();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const samplePrompts = [
    "I want to become better at DSA.",
    "I want to get fit but I keep missing workouts.",
    "I want to study 2 hours every day.",
    "Give me a hard coding quest.",
    "Why am I not leveling up?",
    "How can I increase Intelligence?"
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/40 shadow-glow-purple">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-2xl shadow-glow-cyan">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-xl text-slate-100">
                AI GAME MASTER
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE COACH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized RPG guidance, adaptive difficulty recalibration, and algorithmic quest synthesis.
            </p>
          </div>
        </div>

        <button
          onClick={loadInsights}
          className="flex items-center gap-1.5 text-xs font-orbitron font-semibold text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
          <span>RE-ANALYZE PROGRESS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Conversational AI Chat */}
        <div className="lg:col-span-2 rpg-card flex flex-col h-[560px] border border-slate-800">
          
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isAi = msg.sender === 'ai';

              return (
                <div key={index} className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
                  {isAi && (
                    <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/60 flex items-center justify-center text-sm shrink-0 mt-1">
                      🤖
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${
                    isAi
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-2xl p-4'
                      : 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-medium rounded-2xl p-3.5 shadow-sm'
                  }`}>
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Suggested Quest Card with [ ACCEPT QUEST ] Button */}
                    {msg.questProposal && (
                      <div className="bg-[#0b101d] border border-cyan-500/50 rounded-xl p-3.5 text-left shadow-glow-cyan mt-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                            <Brain className="w-3.5 h-3.5" />
                            YOUR NEXT ADVENTURE
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                            {msg.questProposal.difficulty}
                          </span>
                        </div>

                        <h4 className="font-orbitron font-bold text-sm text-slate-100 mb-1">
                          {msg.questProposal.title}
                        </h4>
                        <p className="text-xs text-slate-400 mb-3">
                          {msg.questProposal.description}
                        </p>

                        {/* Authoritative Rewards */}
                        <div className="flex items-center gap-2 mb-3 text-xs font-orbitron font-semibold">
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Zap className="w-3 h-3 fill-cyan-400" />
                            +{msg.questProposal.xpReward} XP
                          </span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Coins className="w-3 h-3 fill-amber-400" />
                            +{msg.questProposal.coinReward} Coins
                          </span>
                          {msg.questProposal.primaryAttribute && (
                            <span className="text-purple-300 text-[10px]">
                              +{msg.questProposal.primaryAttribute}
                            </span>
                          )}
                        </div>

                        {/* [ ACCEPT QUEST ] Button */}
                        {msg.isAccepted ? (
                          <div className="w-full py-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>QUEST ACCEPTED INTO DATABASE!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAcceptQuest(msg.questProposal, index)}
                            disabled={acceptingQuestId === index}
                            className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-orbitron font-bold text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{acceptingQuestId === index ? 'CREATING CONTRACT...' : '[ ACCEPT QUEST ]'}</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-cyan-400 font-orbitron">
                <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/60 flex items-center justify-center text-sm shrink-0">
                  🤖
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl animate-pulse">
                  Consulting the RPG matrix...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950/60 rounded-b-xl"
          >
            <input
              type="text"
              placeholder="Tell the Game Master what you want to achieve or improve..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-orbitron font-bold text-xs tracking-wider disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* Right Col: Adaptive Coach Insights & AI Action Plan */}
        <div className="space-y-4">
          
          {/* Real AI Coach Diagnostics */}
          <div className="rpg-card p-5 border border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-xs uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Your AI Coach Diagnostics</span>
            </div>

            {coachInsights ? (
              <div className="space-y-3">
                {coachInsights.insights.map((insight, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-cyan-400 font-bold mt-0.5">•</span>
                    <span>{insight}</span>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                  <span>Recommended Pacing:</span>
                  <span className="font-orbitron font-bold text-cyan-400">
                    {coachInsights.recommendedDifficulty} Difficulty
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                Synthesizing activity trends...
              </div>
            )}
          </div>

          {/* AI Training Plan (ACCEPT AI PLAN) */}
          <div className="rpg-card p-5 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-orbitron font-bold uppercase tracking-wider text-purple-300">
                Recommended AI Plan
              </span>
              <span className="text-[10px] text-slate-400">Tailored 2-Phase</span>
            </div>

            {coachInsights?.suggestedPlan ? (
              <div className="space-y-3">
                {coachInsights.suggestedPlan.map((planItem, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                      <span className="text-purple-300 font-orbitron">{planItem.category}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">{planItem.difficulty}</span>
                    </div>
                    <div className="font-bold text-slate-200 mb-1">{planItem.title}</div>
                    <div className="text-[11px] text-slate-400">{planItem.description}</div>
                  </div>
                ))}

                {planAccepted ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>PLAN ACTIVE IN QUEST LOG!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAcceptPlan}
                    className="w-full py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-glow-purple transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>[ ACCEPT AI PLAN ]</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : null}
          </div>

        </div>

      </div>

    </div>
  );
}
