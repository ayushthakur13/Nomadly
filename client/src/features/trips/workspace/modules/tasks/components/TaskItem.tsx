import React, { useMemo, useState, useRef } from 'react';
import type { Task, Trip } from '@shared/types';
import type { TripMember } from '@/services/members.service';
import { 
  canCompleteTask, 
  canDeleteTask, 
  canEditTask,
  canEditTaskStructure,
  canEditTaskContent 
} from '../utils/taskPermissions';
import { isToday, formatDueDate, isOverdue } from '../utils/taskHelpers';
import TaskCheckbox from './TaskCheckbox';
import TaskAssignees from './TaskAssignees';
import { Icon } from '@/ui/icon/';
import { ThreeDotMenu } from '@/ui/common/';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { resolveUserId } from '../utils/idNormalizer';

interface Props {
  task: Task;
  currentUserId: string | null;
  trip: Trip | null;
  members: TripMember[];
  pending?: {
    completing?: 'complete' | 'uncomplete';
    updating?: boolean;
    deleting?: boolean;
  };
  onToggleComplete: (id: string, next: boolean) => Promise<void> | void;
  onUpdate: (id: string, patch: Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'assignedTo'>>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export default function TaskItem({ task, currentUserId, trip, members, pending, onToggleComplete, onUpdate, onDelete }: Props) {
  const allowedComplete = canCompleteTask(task, currentUserId, trip || null);
  const allowedEditStructure = canEditTaskStructure(task, currentUserId, trip || null);
  const allowedEditContent = canEditTaskContent(task, currentUserId, trip || null);
  const allowedEdit = canEditTask(task, currentUserId, trip || null);
  const allowedDelete = canDeleteTask(task, currentUserId, trip || null);

  const completionSet = useMemo(() => {
    return new Set(task.completions.map(c => resolveUserId(c.userId)).filter(Boolean));
  }, [task.completions]);

  const isCompletedByMe = useMemo(() => !!currentUserId && completionSet.has(currentUserId), [completionSet, currentUserId]);

  const isAssignedToMe = useMemo(() => {
    if (!currentUserId) return false;
    if (!task.assignedTo || task.assignedTo.length === 0) return true; // Everyone
    return task.assignedTo.includes(currentUserId);
  }, [task.assignedTo, currentUserId]);

  // Checkbox state logic:
  // - If I'm an assignee (can interact): show MY completion status
  // - If I'm not an assignee (view-only): show whether ALL assignees completed
  const isTaskCompleted = useMemo(() => {
    if (isAssignedToMe) {
      return isCompletedByMe;
    }
    // For tasks I'm not assigned to, show overall completion
    if (task.assignedTo && task.assignedTo.length > 0) {
      return task.assignedTo.every(id => completionSet.has(id));
    }
    return false;
  }, [isAssignedToMe, isCompletedByMe, task.assignedTo, completionSet]);

  const isDueToday = useMemo(() => {
    if (!task.dueDate) return false;
    return isToday(new Date(task.dueDate));
  }, [task.dueDate]);

  const isTaskOverdue = useMemo(() => {
    if (!task.dueDate || isTaskCompleted) return false;
    return isOverdue(new Date(task.dueDate));
  }, [task.dueDate, isTaskCompleted]);

  const isCreator = task.createdBy === currentUserId;

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [titleInput, setTitleInput] = useState(task.title);
  const [descriptionInput, setDescriptionInput] = useState(task.description || '');
  const [dueDateInput, setDueDateInput] = useState(task.dueDate || '');

  const taskItemRef = useRef<HTMLDivElement>(null);

  // Exit edit mode when clicking outside the task item
  useOnClickOutside(taskItemRef, () => {
    if (isEditing) {
      setIsEditing(false);
      setEditingTitle(false);
      setEditingDescription(false);
      setEditingDueDate(false);
    }
  }, isEditing);

  const handleTitleCommit = () => {
    if (!allowedEditStructure) return;
    if (titleInput.trim() && titleInput !== task.title) {
      onUpdate(task._id, { title: titleInput.trim() });
    }
    setEditingTitle(false);
  };

  const handleDescriptionCommit = () => {
    if (!allowedEditContent) return;
    if (descriptionInput !== (task.description || '')) {
      onUpdate(task._id, { description: descriptionInput || undefined });
    }
    setEditingDescription(false);
  };

  const handleDueDateCommit = () => {
    if (!allowedEditContent) return;
    if (dueDateInput !== (task.dueDate || '')) {
      onUpdate(task._id, { dueDate: dueDateInput || undefined });
    }
    setEditingDueDate(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, commit: () => void, cancel: () => void) => {
    if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  // Get creator name
  const creatorName = useMemo(() => {
    if (!task.createdBy) return '';
    
    // Check if creator username was stored during normalization
    const storedUsername = (task as any)._creatorUsername;
    if (storedUsername) {
      return task.createdBy === currentUserId ? 'you' : storedUsername;
    }
    
    // Fall back to looking up in members list
    if (task.createdBy === currentUserId) {
      return 'you';
    }
    
    const member = members.find(m => m.userId === task.createdBy);
    if (member?.name) return member.name;
    if (member?.username) return member.username;
    
    return '';
  }, [task, members, currentUserId]);

  return (
    <div
      ref={taskItemRef}
      className={`
        flex items-start gap-3 py-3 border-b border-gray-100 transition-all
        ${isAssignedToMe ? 'border-l-4 border-l-emerald-500 pl-3 -ml-1' : ''}
        ${pending?.deleting ? 'opacity-50' : ''}
      `}
    >
      <div className="mt-0.5">
        <TaskCheckbox
          checked={isTaskCompleted}
          disabled={!allowedComplete}
          loading={!!pending?.completing}
          onChange={(checked) => onToggleComplete(task._id, checked)}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Title */}
        {editingTitle ? (
          <input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleCommit}
            onKeyDown={(e) => onKey(e, handleTitleCommit, () => { setEditingTitle(false); setTitleInput(task.title); })}
            className="w-full bg-transparent border-b border-gray-300 focus:border-emerald-500 focus:outline-none text-lg font-semibold text-gray-900 pb-1"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 mb-1 group">
            <div
              className={`
                text-lg font-semibold transition-colors
                ${isAssignedToMe ? 'text-gray-900' : 'text-gray-700'}
                ${isTaskCompleted ? 'line-through text-gray-500' : ''}
                ${allowedEditStructure ? 'cursor-text' : 'cursor-default'}
              `}
              onClick={() => allowedEditStructure && setEditingTitle(true)}
              title={!allowedEditStructure && allowedEditContent ? 'Only task creator or trip creator can change task title' : ''}
            >
              {task.title}
            </div>
            {!allowedEditStructure && allowedEditContent && (
              <span title="Only task creator or trip creator can change task title">
                <Icon 
                  name="lock" 
                  size={12} 
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </span>
            )}
            {isDueToday && !isTaskCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Today
              </span>
            )}
            {isTaskOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                <Icon name="alertCircle" size={12} />
                Overdue
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {editingDescription ? (
          <textarea
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            onBlur={handleDescriptionCommit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditingDescription(false);
                setDescriptionInput(task.description || '');
              }
            }}
            className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-emerald-500 focus:outline-none text-sm text-gray-700 resize-none mb-2"
            rows={2}
            autoFocus
          />
        ) : task.description ? (
          <div
            className={`text-sm text-gray-700 mb-2 whitespace-pre-wrap ${allowedEditContent && isEditing ? 'cursor-text' : 'cursor-default'}`}
            onClick={() => allowedEditContent && isEditing && setEditingDescription(true)}
            title={!allowedEditContent ? 'Only assigned members or task/trip creator can edit description' : ''}
          >
            {task.description}
          </div>
        ) : (allowedEditContent && isEditing) ? (
          <button
            onClick={() => setEditingDescription(true)}
            className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 transition-colors"
          >
            <Icon name="plus" size={12} />
            Add description
          </button>
        ) : null}

        {/* Meta row as chips */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-600">
          {/* Creator chip */}
          {!editingTitle && (isCreator || creatorName) && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
              <Icon name="user" size={12} className="text-gray-400" />
              <span>{isCreator ? 'Added by you' : `Added by ${creatorName}`}</span>
            </div>
          )}

          {/* Due date chip */}
          <div className="inline-flex items-center">
            {editingDueDate ? (
              <input
                type="date"
                value={dueDateInput?.slice(0, 10) || ''}
                onChange={(e) => setDueDateInput(e.target.value)}
                onBlur={handleDueDateCommit}
                onKeyDown={(e) => onKey(e, handleDueDateCommit, () => { setEditingDueDate(false); setDueDateInput(task.dueDate || ''); })}
                className="bg-transparent border-b border-gray-300 focus:border-emerald-500 focus:outline-none text-[11px]"
                autoFocus
              />
            ) : (
              <button
                type="button"
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${allowedEditContent && isEditing ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : 'bg-gray-50 border-gray-200 cursor-default'}`}
                onClick={() => allowedEditContent && isEditing && setEditingDueDate(true)}
                title={!allowedEditContent ? 'Only assigned members or task/trip creator can edit due date' : ''}
              >
                <Icon name="calendar" size={12} className="text-gray-400" />
                <span>{task.dueDate ? formatDueDate(task.dueDate) : 'No due date'}</span>
              </button>
            )}
          </div>

          {/* Assignees chip */}
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
            <TaskAssignees
              assignedTo={task.assignedTo || null}
              members={members}
              completions={task.completions}
            />
          </div>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="flex-shrink-0">
        <ThreeDotMenu
          visible={allowedEdit || allowedDelete}
          loading={!!pending?.updating || !!pending?.deleting}
          actions={[
            ...(allowedEdit
              ? [{
                  label: isEditing ? 'Done' : 'Edit',
                  icon: isEditing ? 'check' : 'edit2',
                  onClick: () => {
                    if (isEditing) {
                      setIsEditing(false);
                      setEditingTitle(false);
                      setEditingDescription(false);
                      setEditingDueDate(false);
                    } else {
                      setIsEditing(true);
                      if (allowedEditStructure) setEditingTitle(true);
                      else if (!task.description) setEditingDescription(true);
                    }
                  },
                }]
              : []),
            ...(allowedDelete
              ? [{
                  label: 'Delete',
                  icon: 'delete',
                  onClick: () => onDelete(task._id),
                  variant: 'danger' as const,
                }]
              : []),
          ]}
        />
      </div>
    </div>
  );
}
