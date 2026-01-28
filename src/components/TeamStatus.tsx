'use client';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: 'Online' | 'Away' | 'Busy' | 'Offline';
}

interface TeamStatusProps {
  members: TeamMember[];
}

const statusColors = {
  Online: 'bg-green-500 text-green-400',
  Away: 'bg-yellow-500 text-yellow-400',
  Busy: 'bg-red-500 text-red-400',
  Offline: 'bg-slate-500 text-slate-400',
};

const statusDotColors = {
  Online: 'bg-green-500',
  Away: 'bg-yellow-500',
  Busy: 'bg-red-500',
  Offline: 'bg-slate-500',
};

export default function TeamStatus({ members }: TeamStatusProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Team Status</h3>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{member.avatar}</span>
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${statusDotColors[member.status]}`}
                ></div>
              </div>
              <span className="text-sm text-slate-300">{member.name}</span>
            </div>
            <span className={`text-xs ${statusColors[member.status].split(' ')[1]}`}>
              {member.status}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
        View Team Roster
      </button>
    </div>
  );
}
