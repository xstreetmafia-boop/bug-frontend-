'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Bug, BugFormData } from '@/types/bug';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import BarChart from '@/components/BarChart';
import PieChart from '@/components/PieChart';
import RecentActivity from '@/components/RecentActivity';
import TeamStatus from '@/components/TeamStatus';
import NewIssueModal from '@/components/NewIssueModal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'Online' | 'Away' | 'Busy' | 'Offline';
  role: string;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [bugsResponse, usersResponse] = await Promise.all([
        api.getBugs(),
        api.getUsers()
      ]);
      
      setBugs(bugsResponse.bugs.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      })));
      
      setTeamMembers(usersResponse.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status || 'Offline',
        role: u.role,
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
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

  // Calculate stats from actual bugs
  const totalBugs = bugs.length;
  const openBugs = bugs.filter((b) => b.status === 'open').length;
  const inProgressBugs = bugs.filter((b) => b.status === 'in-progress').length;
  const criticalBugs = bugs.filter((b) => b.severity === 'critical').length;
  const resolvedBugs = bugs.filter((b) => b.status === 'resolved').length;

  // Generate chart data from actual bugs
  const barChartData = [
    { day: 'Mon', found: 0, resolved: 0 },
    { day: 'Tue', found: 0, resolved: 0 },
    { day: 'Wed', found: 0, resolved: 0 },
    { day: 'Thu', found: 0, resolved: 0 },
    { day: 'Fri', found: 0, resolved: 0 },
    { day: 'Sat', found: 0, resolved: 0 },
    { day: 'Sun', found: totalBugs, resolved: resolvedBugs },
  ];

  const pieChartData = [
    { label: 'Critical', value: criticalBugs || 0, color: '#ef4444' },
    { label: 'High', value: bugs.filter((b) => b.severity === 'high').length || 0, color: '#f97316' },
    { label: 'Medium', value: bugs.filter((b) => b.severity === 'medium').length || 0, color: '#3b82f6' },
    { label: 'Low', value: bugs.filter((b) => b.severity === 'low').length || 0, color: '#22c55e' },
  ];

  const recentActivities = bugs.slice(0, 5).map((bug) => ({
    id: bug.id,
    user: bug.reportedBy || 'Unknown',
    avatar: (bug.reportedBy || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2),
    action: 'reported issue',
    target: `#${bug.id.slice(0, 4)} - ${bug.title}`,
    result: bug.status === 'resolved' ? 'Resolved' : undefined,
    resultType: bug.status === 'resolved' ? 'success' as const : undefined,
    time: 'Just now',
    type: 'user' as const,
  }));

  const formattedTeamMembers = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
    status: m.status as 'Online' | 'Away' | 'Busy' | 'Offline',
  }));

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

      {/* Main Content */}
      <main className="ml-60 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Overview</h1>
            <p className="text-slate-400 text-sm">Project Phoenix • Last updated: Just now</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Last 7 Days
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Open Bugs"
            value={totalBugs}
            change="12%"
            changeType="negative"
            icon={
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-blue-500/20"
          />
          <StatsCard
            title="In Progress"
            value={inProgressBugs}
            subtitle="Active tickets"
            icon={
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-yellow-500/20"
          />
          <StatsCard
            title="Critical Issues"
            value={criticalBugs}
            subtitle="Needs attention"
            icon={
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            iconBg="bg-red-500/20"
          />
          <StatsCard
            title="Resolved Today"
            value={resolvedBugs}
            change={resolvedBugs > 0 ? "+" + resolvedBugs : ""}
            changeType="positive"
            icon={
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-green-500/20"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <BarChart data={barChartData} />
          </div>
          <PieChart data={pieChartData} total={totalBugs || 1} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} />
          </div>
          <TeamStatus members={formattedTeamMembers} />
        </div>
      </main>

      {/* New Issue Modal */}
      <NewIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
