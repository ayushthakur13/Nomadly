import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ConfirmationModal, ErrorAlert, PageHeader } from "@/ui/common";
import { Icon } from "@/ui/icon";
import type { Accommodation, CreateAccommodationDTO, UpdateAccommodationDTO } from "@shared/types";
import { useAuth } from "@/features/auth/hooks";
import { updateTrip } from "@/features/trips/store";
import { useAccommodations } from "./hooks/useAccommodations";
import AccommodationList from "./components/AccommodationList";
import AccommodationFormModal from "./components/AccommodationFormModal";

const AccommodationsPage = () => {
  const dispatch = useDispatch<any>();
  const { user } = useAuth();
  const { selectedTrip } = useSelector((state: any) => state.trips || {});

  const {
    accommodations,
    loading,
    actionLoading,
    error,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
  } = useAccommodations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Accommodation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Accommodation | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const currentUserId = (user as any)?.id || (user as any)?._id;
  const tripCreatorId = (selectedTrip?.createdBy as any)?._id || selectedTrip?.createdBy;
  const isTripCreator = Boolean(tripCreatorId && currentUserId && tripCreatorId === currentUserId);
  const allowMemberStayEdits = Boolean(selectedTrip?.stayPermissions?.allowMemberStayEdits);

  const canManageAccommodation = (accommodation: Accommodation) => {
    if (isTripCreator) return true;

    const isOwner = Boolean(accommodation.createdBy && currentUserId && accommodation.createdBy === currentUserId);
    if (isOwner) return true;

    return allowMemberStayEdits;
  };

  const totalNights = useMemo(() => {
    return accommodations.reduce((sum, item) => {
      if (!item.checkIn || !item.checkOut) return sum;
      const start = new Date(item.checkIn).getTime();
      const end = new Date(item.checkOut).getTime();
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return nights > 0 ? sum + nights : sum;
    }, 0);
  }, [accommodations]);

  const subtitle = useMemo(() => {
    if (accommodations.length === 0) return "Keep all stay details aligned for the group.";
    const stays = `${accommodations.length} ${accommodations.length === 1 ? "stay" : "stays"}`;
    const nights = `${totalNights} ${totalNights === 1 ? "night" : "nights"}`;
    return `${stays} · ${nights}`;
  }, [accommodations.length, totalNights]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (accommodation: Accommodation) => {
    if (!canManageAccommodation(accommodation)) return;
    setEditing(accommodation);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: CreateAccommodationDTO | UpdateAccommodationDTO) => {
    setActionError(null);
    try {
      if (editing) {
        await updateAccommodation(editing._id, payload);
      } else {
        await createAccommodation(payload as CreateAccommodationDTO);
      }
    } catch (err: any) {
      setActionError(err?.message || "Unable to save accommodation");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!canManageAccommodation(deleteTarget)) {
      setActionError("You do not have permission to delete this stay");
      return;
    }
    setActionError(null);
    try {
      await deleteAccommodation(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err: any) {
      setActionError(err?.message || "Unable to delete accommodation");
    }
  };

  const showEmpty = !loading && accommodations.length === 0;

  const toggleCollaborativeEdits = async () => {
    if (!selectedTrip?._id || !isTripCreator || settingsLoading) return;
    setActionError(null);
    setSettingsLoading(true);
    try {
      await dispatch(
        updateTrip({
          tripId: selectedTrip._id,
          updates: {
            stayPermissions: {
              allowMemberStayEdits: !allowMemberStayEdits,
            },
          },
        })
      ).unwrap();
    } catch (err: any) {
      setActionError(err?.message || "Unable to update stay edit settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stay & Accommodations"
        subtitle={subtitle}
        secondaryAction={
          isTripCreator
            ? {
                label: settingsLoading
                  ? "Updating..."
                  : allowMemberStayEdits
                  ? "Member edits: On"
                  : "Member edits: Off",
                onClick: toggleCollaborativeEdits,
                icon: <Icon name={allowMemberStayEdits ? "checkCircle" : "lock"} size={16} />,
              }
            : undefined
        }
        action={{
          label: "Add stay",
          onClick: openCreate,
          icon: <Icon name="add" size={18} />,
        }}
      />

      <ErrorAlert error={error || actionError} />

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600" />
          Loading accommodations...
        </div>
      ) : showEmpty ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Icon name="home" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Plan where you will stay</h3>
          <p className="text-gray-600 mb-6">
            Add your first stay to keep check-in details, booking links, and notes in one place.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Icon name="add" size={16} /> Add first stay
          </button>
        </div>
      ) : (
        <AccommodationList
          accommodations={accommodations}
          canManageAccommodation={canManageAccommodation}
          onEdit={openEdit}
          onDelete={(item) => {
            if (!canManageAccommodation(item)) {
              setActionError("You do not have permission to delete this stay");
              return;
            }
            setDeleteTarget(item);
          }}
        />
      )}

      <AccommodationFormModal
        open={modalOpen}
        initial={editing}
        submitting={actionLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete stay"
        description={`Are you sure you want to remove ${deleteTarget?.name || "this stay"}? This cannot be undone.`}
        confirmText="Delete stay"
        cancelText="Keep stay"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AccommodationsPage;
