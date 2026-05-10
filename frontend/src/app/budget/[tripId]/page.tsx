'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { budgetService } from '@/services/index';
import { formatCurrency } from '@/lib/utils';
import DashboardLayout from '../../dashboard/layout';
import { useState } from 'react';

const BUDGET_CATEGORIES = [
  { key: 'flights', label: 'Flights', emoji: '✈️', color: '#6366f1' },
  { key: 'hotels', label: 'Hotels', emoji: '🏨', color: '#8b5cf6' },
  { key: 'food', label: 'Food', emoji: '🍽️', color: '#10b981' },
  { key: 'activities', label: 'Activities', emoji: '🎡', color: '#06b6d4' },
  { key: 'transport', label: 'Transport', emoji: '🚌', color: '#f59e0b' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#f43f5e' },
  { key: 'emergency', label: 'Emergency', emoji: '🆘', color: '#64748b' },
  { key: 'misc', label: 'Misc', emoji: '📦', color: '#334155' },
];

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const queryClient = useQueryClient();

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget', tripId],
    queryFn: () => budgetService.getBudget(tripId),
    enabled: !!tripId,
  });

  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: object) => budgetService.updateBudget(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', tripId] });
      setIsEditing(false);
      toast.success('Budget updated!');
    },
  });

  const budgetResult = budgetData?.data as {
    budget?: Record<string, number>;
    totalBudget?: number;
    totalPlanned?: number;
    remaining?: number;
    utilizationPercentage?: number;
  };

  const budget = budgetResult?.budget;
  const totalBudget = budgetResult?.totalBudget || 0;
  const totalPlanned = budgetResult?.totalPlanned || 0;
  const remaining = budgetResult?.remaining || 0;
  const utilization = budgetResult?.utilizationPercentage || 0;

  const pieData = BUDGET_CATEGORIES
    .filter(cat => (budget?.[cat.key] || 0) > 0)
    .map(cat => ({ name: cat.label, value: budget?.[cat.key] || 0, color: cat.color }));

  const barData = BUDGET_CATEGORIES.map(cat => ({
    name: cat.label,
    amount: budget?.[cat.key] || 0,
  }));

  const handleSave = () => {
    updateMutation.mutate(editValues);
  };

  const startEdit = () => {
    const current: Record<string, number> = {};
    BUDGET_CATEGORIES.forEach(cat => { current[cat.key] = budget?.[cat.key] || 0; });
    setEditValues(current);
    setIsEditing(true);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/trips/${tripId}`} className="p-2 rounded-xl glass hover:bg-surface-800 text-surface-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" /> Budget Analytics
            </h1>
          </div>
          <button
            onClick={isEditing ? handleSave : startEdit}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
          >
            {isEditing ? (updateMutation.isPending ? 'Saving...' : 'Save Budget') : 'Edit Budget'}
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Budget', value: formatCurrency(totalBudget), icon: DollarSign, color: 'text-brand-400', bg: 'bg-brand-500/10' },
            { label: 'Planned', value: formatCurrency(totalPlanned), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Remaining', value: formatCurrency(remaining), icon: PieChart, color: remaining >= 0 ? 'text-emerald-400' : 'text-red-400', bg: remaining >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
          ].map((card) => (
            <div key={card.label} className="glass-card p-4 text-center">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mx-auto mb-2`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="font-bold text-white text-lg">{card.value}</div>
              <div className="text-surface-500 text-xs">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Utilization Bar */}
        <div className="glass-card p-5 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-surface-300 text-sm">Budget Utilization</span>
            <span className={`text-sm font-bold ${utilization > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
              {Math.round(utilization)}%
            </span>
          </div>
          <div className="h-3 bg-surface-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${utilization > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-brand-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(utilization, 100)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Budget Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPie>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(Number(val))} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-surface-400">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bar Chart */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-35} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip formatter={(val) => formatCurrency(Number(val))} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Edit */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Budget by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUDGET_CATEGORIES.map((cat) => (
              <div key={cat.key} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50">
                <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm text-surface-300 mb-1">{cat.label}</div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues[cat.key] || 0}
                      onChange={(e) => setEditValues(p => ({ ...p, [cat.key]: parseFloat(e.target.value) || 0 }))}
                      className="input-field text-sm py-1.5"
                    />
                  ) : (
                    <div className="text-white font-semibold">{formatCurrency(budget?.[cat.key] || 0)}</div>
                  )}
                </div>
                <div className="w-2 h-full min-h-8 rounded-full" style={{ backgroundColor: cat.color + '40' }}>
                  <div className="w-2 rounded-full" style={{ backgroundColor: cat.color, height: `${Math.min(((budget?.[cat.key] || 0) / (totalPlanned || 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-surface-400 hover:text-white text-sm">Cancel</button>
              <button onClick={handleSave} disabled={updateMutation.isPending} className="px-6 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50">
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
