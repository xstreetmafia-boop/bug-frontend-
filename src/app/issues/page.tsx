'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Bug, BugFormData, BugStatus, BugSeverity, BugPriority } from '@/types/bug';
import Sidebar from '@/components/Sidebar';
import NewIssueModal from '@/components/NewIssueModal';

// Mock data for demo purposes matching the design
const mockBugs: Bug[] = [
  {
    id: 'BUG-1024',
    title: 'Login page crashes on Safari 16',
    description: 'Users on Safari 16 experience crashes when trying to log in',
    status: 'in-progress',
    severity: 'high',
    priority: 'high',
    reportedBy: 'Sarah Jenkins',
    assignee: 'Sarah Jenkins',
    tags: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'BUG-1023',
    title: 'Update copyright footer year',
    description: 'Footer shows outdated copyright year',
    status: 'resolved',
    severity: 'low',
    priority: 'low',
    reportedBy: 'Mike Ross',
    assignee: 'Mike Ross',
    tags: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'BUG-1022',
    title: 'API timeout on large exports',
    description: 'Backend API times out when exporting large datasets',
    status: 'open',
    severity: 'critical',
    priority: 'high',
    reportedBy: 'System',
    assignee: undefined,
    tags: ['BACKEND'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'BUG-1021',
    title: 'Mobile view alignment error in dashboard',
    description: 'Dashboard widgets misalign on mobile devices',
    status: 'in-progress',
    severity: 'medium',
    priority: 'medium',
    reportedBy: 'John Doe',
    assignee: 'John Doe',
    tags: ['UI'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'BUG-1020',
    title: 'Database connection retry logic fails on timeout',
    description: 'Connection retry mechanism not working properly',
    status: 'open',
    severity: 'high',
    priority: 'high',
    reportedBy: 'Alex Morgan',
    assignee: 'Alex Morgan',
    tags: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'BUG-1019',
    title: 'Navigation menu collapsed state not persisting',
    description: 'Menu state resets on page refresh',
    status: 'open',
    severity: 'low',
    priority: 'low',
    reportedBy: 'System',
    assignee: undefined,
    tags: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'BUG-1018',
    title: 'Dark mode flashes white on initial load',
    description: 'Brief white flash when loading in dark mode',
    status: 'resolved',
    severity: 'medium',
    priority: 'medium',
    reportedBy: 'Sarah Jenkins',
    assignee: 'Sarah Jenkins',
    tags: ['UX'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'BUG-1017',
    title: 'Export to CSV formatting broken for UTF-8',
    description: 'Special characters not rendering correctly in exports',
    status: 'in-progress',
    severity: 'low',
    priority: 'low',
    reportedBy: 'Mike Ross',
    assignee: 'Mike Ross',
    tags: [],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; dotColor?: string }> = {
  'open': { label: 'To Do', bgColor: 'bg-slate-600', textColor: 'text-white', dotColor: 'bg-slate-400' },
  'in-progress': { label: 'In Progress', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400', dotColor: 'bg-amber-400' },
  'resolved': { label: 'Fixed', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400', dotColor: 'bg-emerald-400' },
  'closed': { label: 'Closed', bgColor: 'bg-slate-500/20', textColor: 'text-slate-400', dotColor: 'bg-slate-400' },
  'blocked': { label: 'Blocked', bgColor: 'bg-red-500/20', textColor: 'text-red-400', dotColor: 'bg-red-400' },
  'in-review': { label: 'In Review', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400', dotColor: 'bg-purple-400' },
};

const priorityConfig: Record<string, { label: string; icon: string; color: string }> = {
  'low': { label: 'Low', icon: '✓', color: 'text-slate-400' },
  'medium': { label: 'Medium', icon: '≡', color: 'text-slate-400' },
  'high': { label: 'High', icon: '⚡', color: 'text-orange-400' },
  'urgent': { label: 'Urgent', icon: '⚡⚡', color: 'text-red-400' },
  'critical': { label: 'Critical', icon: '🔥', color: 'text-red-400' },
};

const tagColors: Record<string, string> = {
  'BACKEND': 'bg-purple-500/30 text-purple-300',
  'UI': 'bg-blue-500/30 text-blue-300',
  'UX': 'bg-cyan-500/30 text-cyan-300',
  'API': 'bg-green-500/30 text-green-300',
};

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 60) return `${diffMins} mins`;
  if (diffHours < 24) return `${diffHours} hours`;
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffWeeks === 1) return '1 week';
  return `${diffWeeks} weeks`;
}

export default function IssuesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'board' | 'timeline'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBugs, setSelectedBugs] = useState<string[]>([]);
  const itemsPerPage = 8;

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
      setLoading(true);
      const { bugs: apiBugs } = await api.getBugs();
      if (apiBugs && apiBugs.length > 0) {
        setBugs(apiBugs.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load bugs:', error);
      // Keep mock data on error
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

  const clearAllFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all';

  const filteredBugs = bugs.filter((bug) => {
    if (statusFilter !== 'all' && bug.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && bug.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned' && bug.assignee) return false;
      if (assigneeFilter !== 'unassigned' && bug.assignee !== assigneeFilter) return false;
    }
    if (searchQuery && !bug.title.toLowerCase().includes(searchQuery.toLowerCase()) && !bug.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredBugs.length / itemsPerPage);
  const paginatedBugs = filteredBugs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleBugSelection = (id: string) => {
    setSelectedBugs(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedBugs.length === paginatedBugs.length) {
      setSelectedBugs([]);
    } else {
      setSelectedBugs(paginatedBugs.map(b => b.id));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Sidebar />

      <main className="ml-60 min-h-screen">
        {/* Top Navigation Bar */}
        <div className="h-14 border-b border-slate-700/50 flex items-center justify-between px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hover:text-white cursor-pointer">Projects</span>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-400 hover:text-white cursor-pointer">Project Alpha</span>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">Issues</span>
          </div>

          {/* Right side - Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search issues (e.g. BUG-123)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-12 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] text-slate-400 font-mono">⌘K</kbd>
              </div>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

            {/* New Issue Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Issue
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">All Issues</h1>
              <p className="text-slate-400 text-sm">Manage and track bugs across Project Alpha</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Columns
              </button>
            </div>
          </div>

          {/* View Tabs and Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              {/* View Tabs */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                {(['list', 'board', 'timeline'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                      activeView === view
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {view === 'list' ? 'List' : view === 'board' ? 'Board' : 'Timeline'}
                  </button>
                ))}
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Status</option>
                    <option value="open">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Fixed</option>
                    <option value="closed">Closed</option>
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Assignee Filter */}
                <div className="relative">
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Assignee</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="Mike Ross">Mike Ross</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Alex Morgan">Alex Morgan</option>
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Issues Table */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedBugs.length === paginatedBugs.length && paginatedBugs.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Assignee</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBugs.map((bug) => {
                  const status = statusConfig[bug.status] || statusConfig['open'];
                  const priority = priorityConfig[bug.priority] || priorityConfig['medium'];
                  
                  return (
                    <tr 
                      key={bug.id} 
                      className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBugs.includes(bug.id)}
                          onChange={() => toggleBugSelection(bug.id)}
                          className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-slate-400 text-sm font-mono">{bug.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{bug.title}</span>
                          {bug.tags?.map((tag) => (
                            <span 
                              key={tag} 
                              className={`px-2 py-0.5 rounded text-xs font-medium ${tagColors[tag] || 'bg-slate-600 text-slate-300'}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative inline-block">
                          <select
                            value={bug.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(bug.id, e.target.value as BugStatus);
                            }}
                            className={`appearance-none cursor-pointer inline-flex items-center gap-1.5 pl-6 pr-7 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${status.bgColor} ${status.textColor}`}
                          >
                            <option value="open">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Fixed</option>
                            <option value="closed">Closed</option>
                          </select>
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${status.dotColor}`}></span>
                          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`${priority.color}`}>{priority.icon}</span>
                          <span className="text-slate-300 text-sm">{priority.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {bug.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full ${getAvatarColor(bug.assignee)} flex items-center justify-center`}>
                              <span className="text-white text-xs font-medium">
                                {bug.assignee.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-slate-300 text-sm">{bug.assignee}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center border-2 border-dashed border-slate-500">
                              <span className="text-slate-400 text-xs">?</span>
                            </div>
                            <span className="text-slate-500 text-sm italic">Unassigned</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-slate-400 text-sm">{getTimeAgo(bug.updatedAt)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
              <div className="text-sm text-slate-400">
                Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, filteredBugs.length)}</span> of{' '}
                <span className="font-medium text-white">{filteredBugs.length}</span> results
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {totalPages > 3 && (
                  <>
                    <span className="px-2 text-slate-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
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
