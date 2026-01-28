'use client';

import { Bug, BugStatus } from '@/types/bug';

interface BugCardProps {
  bug: Bug;
  onStatusChange: (id: string, status: BugStatus) => void;
  onDelete: (id: string) => void;
}

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-purple-100 text-purple-800',
  urgent: 'bg-pink-100 text-pink-800',
};

const statusColors = {
  open: 'bg-red-500',
  'in-progress': 'bg-yellow-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
};

export default function BugCard({ bug, onStatusChange, onDelete }: BugCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">{bug.title}</h3>
        <span className={`w-3 h-3 rounded-full ${statusColors[bug.status]}`} title={bug.status} />
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bug.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[bug.severity]}`}>
          {bug.severity.charAt(0).toUpperCase() + bug.severity.slice(1)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[bug.priority]}`}>
          {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)} Priority
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>Reported by: {bug.reportedBy}</span>
        <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={bug.status}
          onChange={(e) => onStatusChange(bug.id, e.target.value as BugStatus)}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Update bug status"
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={() => onDelete(bug.id)}
          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
