import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ErrorAlert } from "@/ui/common";
import { Icon } from "@/ui/icon";
import { TaskHeader, AddTaskRow, TaskFilters, TaskList } from "./components/";
import { useTasks, useTaskStats } from "./hooks/";
import { useTripMembers } from "../members/hooks/useTripMembers";
import type { Task, Trip } from "@shared/types";

const TasksPage = () => {
  const { selectedTrip } = useSelector((state: any) => state.trips || {});
  const trip: Trip | null = selectedTrip || null;

  const {
    tripId,
    currentUserId,
    sortedTasks,
    loading,
    error,
    create,
    update,
    remove,
    toggleComplete,
    pendingOps,
  } = useTasks();

  const { members, loading: membersLoading } = useTripMembers(tripId);
  const stats = useTaskStats(sortedTasks, currentUserId);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(sortedTasks);
  const [actionError, setActionError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setFilteredTasks(sortedTasks);
  }, [sortedTasks]);

  const handleCreate = async (data: {
    title: string;
    description?: string;
    dueDate?: string;
    assignees: string[];
  }) => {
    setCreating(true);
    setActionError(null);
    try {
      // If all members are selected, treat as "everyone" (null)
      const allMembersSelected = data.assignees.length === members.length && members.length > 0;
      const assignedTo = allMembersSelected ? null : (data.assignees.length ? data.assignees : null);
      
      await create({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignedTo,
      });
    } catch (err: any) {
      setActionError(err?.message || "Unable to create task");
    } finally {
      setCreating(false);
    }
  };

  const showEmpty = !loading && filteredTasks.length === 0;

  return (
    <div>
      <TaskHeader
        totalCount={stats.total}
        assignedToMeCount={stats.assignedToMeCount}
        dueTodayCount={stats.dueTodayCount}
      />

      <ErrorAlert error={error || actionError} />

      <AddTaskRow
        members={members}
        membersLoading={membersLoading}
        creating={creating}
        onSubmit={handleCreate}
      />

      <TaskFilters
        tasks={sortedTasks}
        currentUserId={currentUserId}
        onChange={setFilteredTasks}
      />

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        {loading && filteredTasks.length === 0 ? (
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600" />
            Loading tasks...
          </div>
        ) : showEmpty ? (
          <div className="text-center py-10 text-gray-600">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Icon name="checkCircle" size={24} />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              No tasks yet
            </div>
            <div className="text-sm text-gray-500">
              Add your first task to get the team aligned.
            </div>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            currentUserId={currentUserId}
            trip={trip}
            members={members}
            pendingOps={pendingOps}
            onToggleComplete={async (id, next) => {
              await toggleComplete(id, next);
            }}
            onUpdate={async (id, patch) => {
              await update(id, patch);
            }}
            onDelete={async (id) => {
              await remove(id);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
