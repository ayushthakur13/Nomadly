import { useState, useRef } from 'react';
import { Popover } from '@headlessui/react';
import type { TripMember } from '@/services/members.service';
import Icon from '@/components/icon/Icon';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface AddTaskRowProps {
  members: TripMember[];
  membersLoading: boolean;
  creating: boolean;
  onSubmit: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    assignees: string[];
  }) => void;
}

export default function AddTaskRow({
  members,
  membersLoading,
  creating,
  onSubmit,
}: AddTaskRowProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useOnClickOutside(containerRef, () => setShowAdvanced(false), showAdvanced);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      assignees,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate('');
    setAssignees([]);
    setShowAdvanced(false);
    titleRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleAssignee = (userId: string) => {
    setAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div ref={containerRef} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="checkCircle" size={18} className="text-emerald-600" />
        <div className="text-sm text-gray-600">Add a task for this trip</div>
      </div>

      <div className="flex gap-3">
        {/* Title Input */}
        <input
          ref={titleRef}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Task title (required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setShowAdvanced(true)}
          onKeyDown={handleKeyDown}
        />

        {/* Assign Button - Popover */}
        <Popover className="relative">
          <Popover.Button className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2">
            <Icon name="users" size={16} />
            Assign
            {assignees.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                {assignees.length}
              </span>
            )}
          </Popover.Button>

          <Popover.Panel className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Assign to (leave empty for everyone)
            </div>
            {membersLoading ? (
              <div className="text-xs text-gray-500 py-2">Loading members...</div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {members.map((member) => (
                  <label
                    key={member.userId}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignees.includes(member.userId)}
                      onChange={() => toggleAssignee(member.userId)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      {member.name || member.username || 'Member'}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Popover.Panel>
        </Popover>

        {/* Add Button */}
        <button
          onClick={handleSubmit}
          disabled={creating || !title.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? (
            <Icon name="loader" size={16} className="animate-spin" />
          ) : (
            <Icon name="add" size={16} />
          )}
          Add
        </button>
      </div>

      {/* Advanced Fields - Progressive Disclosure */}
      {showAdvanced && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              ref={descRef}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Add details..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Due date (optional)
            </label>
            <input
              ref={dateRef}
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
