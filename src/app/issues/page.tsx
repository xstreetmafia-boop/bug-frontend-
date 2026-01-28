'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Bug, BugFormData, BugStatus, BugSeverity } from '@/types/bug';
import Sidebar from '@/components/Sidebar';
import NewIssueModal from '@/components/NewIssueModal';

const severityColors = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

const statusColors = {
  open: 'bg-red-500',
  'in-progress': 'bg-yellow-500',
  resolved: 'bg-green-500',
  closed: 'bg-slate-500',
};

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-purple-500/20 text-purple-400',
  urgent: 'bg-pink-500/20 text-pink-400',
};

export default function IssuesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<BugSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadBugs();
    }
  }, [user]);

  const loadBugs = async () => {
    try {
      const { bugs } = await api.getBugs();
      setBugs(bugs.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      })));
    } catch (error) {
      console.error('Failed to load bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: BugFormData) => {
    try {
      const { bug } = await api.createBug({
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        priority: formData.priority,
      });
      setBugs([{
        ...bug,
        createdAt: new Date(bug.createdAt),
        updatedAt: new Date(bug.updatedAt),
      }, ...bugs]);
    } catch (error) {
      console.error('Failed to create bug:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: BugStatus) => {
    try {
      await api.updateBug(id, { status: newStatus });
      setBugs(bugs.map((bug) =>
        bug.id === id ? { ...bug, status: newStatus, updatedAt: new Date() } : bug
      ));
    } catch (error) {
      console.error('Failed to update bug:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBug(id);
      setBugs(bugs.filter((bug) => bug.id !== id));
    } catch (error) {
      console.error('Failed to delete bug:', error);
    }
  };

  const filteredBugs = bugs.filter((bug) => {
    if (statusFilter !== 'all' && bug.status !== statusFilter) return false;
    if (severityFilter !== 'all' && bug.severity !== severityFilter) return false;
    if (searchQuery && !bug.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />

      <main className="ml-60 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Issues</h1>
            <p className="text-slate-400 text-sm">{filteredBugs.length} issues found</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Issue
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BugStatus | 'all')}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as BugSeverity | 'all')}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Issue</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Severity</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Priority</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Reporter</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.map((bug) => (
                <tr key={bug.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{bug.title}</p>
                      <p className="text-slate-400 text-sm truncate max-w-md">{bug.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[bug.severity]}`}>
                      {bug.severity.charAt(0).toUpperCase() + bug.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[bug.priority]}`}>
                      {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={bug.status}
                      onChange={(e) => handleStatusChange(bug.id, e.target.value as BugStatus)}
                      className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{bug.reportedBy}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(bug.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBugs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400">No issues found</p>
            </div>
          )}
        </div>
      </main>

      <NewIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
