import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Coins, Shield, Sparkles, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGame } from '../../context/GameContext.jsx';

export default function ShopModal({ isOpen, onClose, onOpenInventory }) {
  const { character, updateCharacter } = useAuth();
  const { playSound } = useGame();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadShop = async () => {
    setLoading(true);
    try {
      const data = await api.getShop();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadShop();
      setMessage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = async (item) => {
    if (purchasingId) return;
    setPurchasingId(item.id);
    setMessage(null);
    setError(null);

    try {
      const res = await api.purchaseShopItem(item.id);
      playSound('complete');
      setMessage(res.message);
      if (res.character) updateCharacter(res.character);
      await loadShop();
    } catch (err) {
      setError(err.message || 'Purchase failed.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0d1322] border border-amber-500/40 rounded-2xl p-6 shadow-glow-gold flex flex-col relative overflow-hidden">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-400">
              🪙
            </div>
            <div>
              <h2 className="text-xl font-orbitron font-black text-slate-100 flex items-center gap-2">
                <span>The Guild Bazaar</span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Virtual Shop
                </span>
              </h2>
              <p className="text-xs text-slate-400">Acquire prestigious titles, luminous frames, and streak shields.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 px-3.5 py-1.5 rounded-xl font-orbitron font-bold text-amber-300 shadow-sm text-sm">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{character?.coins?.toLocaleString() || 0} COINS</span>
            </div>
            <button
              onClick={() => { onClose(); onOpenInventory(); }}
              className="text-xs font-orbitron font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Open Inventory
            </button>
          </div>
        </div>

        {/* Alert Notifications */}
        {message && (
          <div className="mb-4 text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-700 p-2.5 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 text-xs font-bold text-rose-300 bg-rose-950/70 border border-rose-700 p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Shop Items Catalog */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-orbitron">
              Loading merchant catalog...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const canAfford = (character?.coins || 0) >= item.cost_coins;
                const isOwnedCosmetic = item.isOwned && item.item_type !== 'shield';

                return (
                  <div
                    key={item.id}
                    className={`rpg-card p-4 border flex flex-col justify-between relative transition-all ${
                      item.rarity === 'legendary'
                        ? 'border-amber-500/50 shadow-glow-gold'
                        : item.rarity === 'epic'
                        ? 'border-purple-500/40'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                          {item.icon}
                        </span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                          item.rarity === 'legendary'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : item.rarity === 'epic'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {item.rarity}
                        </span>
                      </div>

                      <h3 className="font-orbitron font-bold text-sm text-slate-100 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs text-amber-300">
                        <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{item.cost_coins}</span>
                      </div>

                      {isOwnedCosmetic ? (
                        <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                          OWNED
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford || purchasingId === item.id}
                          className={`px-3 py-1.5 rounded-lg font-orbitron font-bold text-xs tracking-wider transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-sm hover:shadow-glow-gold'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {purchasingId === item.id ? 'BUYING...' : 'PURCHASE'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
