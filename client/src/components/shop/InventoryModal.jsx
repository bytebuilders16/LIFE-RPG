import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function InventoryModal({ isOpen, onClose, onOpenShop }) {
  const { character, updateCharacter } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [equippingId, setEquippingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setInventory(data.inventory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInventory();
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEquip = async (item) => {
    if (item.item_type === 'shield') return; // Consumable automatically
    setEquippingId(item.item_id);
    setMessage(null);

    try {
      const res = await api.equipItem({
        itemType: item.item_type,
        itemCode: item.code,
        itemName: item.name
      });
      if (res.character) updateCharacter(res.character);
      setMessage(res.message);
      await loadInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setEquippingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#0d1322] border border-cyan-500/40 rounded-2xl p-6 shadow-glow-cyan flex flex-col relative overflow-hidden">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-orbitron font-black text-slate-100 flex items-center gap-2">
              <span>Adventurer's Vault</span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                INVENTORY
              </span>
            </h2>
            <p className="text-xs text-slate-400">Equip earned titles, cosmetic frames, and inspect streak shields.</p>
          </div>

          <button
            onClick={() => { onClose(); onOpenShop(); }}
            className="text-xs font-orbitron font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-sm transition-all"
          >
            Visit Bazaar
          </button>
        </div>

        {message && (
          <div className="mb-4 text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700 p-2.5 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{message}</span>
          </div>
        )}

        {/* Inventory List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-orbitron">
              Opening inventory vault...
            </div>
          ) : inventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => {
                const isEquipped = item.is_equipped === 1;
                const isShield = item.item_type === 'shield';

                return (
                  <div
                    key={item.inventory_id}
                    className={`rpg-card p-4 border flex flex-col justify-between relative transition-all ${
                      isEquipped ? 'border-cyan-400 shadow-glow-cyan' : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                          {item.icon}
                        </span>
                        {isEquipped && (
                          <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            EQUIPPED
                          </span>
                        )}
                        {isShield && (
                          <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            QTY: {item.quantity}
                          </span>
                        )}
                      </div>

                      <h3 className="font-orbitron font-bold text-sm text-slate-100 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {item.item_type}
                      </span>

                      {isShield ? (
                        <span className="text-xs font-semibold text-amber-300">
                          Automatic Protection
                        </span>
                      ) : isEquipped ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          ACTIVE
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEquip(item)}
                          disabled={equippingId === item.item_id}
                          className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-orbitron font-bold text-xs tracking-wider transition-colors cursor-pointer"
                        >
                          {equippingId === item.item_id ? 'EQUIPPING...' : 'EQUIP'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">Your inventory is empty.</p>
              <p className="text-xs text-slate-500 mt-1">Conquer quests to earn coins, then acquire rewards from the Bazaar!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
