import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmationModal, ErrorAlert, FormAlert, PageHeader } from "@/ui/common";
import { Icon } from "@/ui/icon";
import type { Accommodation, CreateAccommodationDTO, UpdateAccommodationDTO, Destination } from "@shared/types";
import { useAuth } from "@/features/auth/hooks";
import { updateTrip } from "@/features/trips/store";
import { useAccommodations } from "./hooks/useAccommodations";
import AccommodationList from "./components/AccommodationList";
import AccommodationFormModal from "./components/AccommodationFormModal";
import { getStayTimelineInsights } from "./utils/formatting";
import { isDateRangeOutOfBounds } from "@/utils/dateValidation";

const AccommodationsPage = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
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

  const stayInsights = useMemo(() => {
    return getStayTimelineInsights(
      accommodations.map((item) => ({
        name: item.name,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
      }))
    );
  }, [accommodations]);

  const destinationSuggestions = useMemo(() => {
    const raw = (selectedTrip?.destinations || []) as Array<Destination | string>;
    return raw
      .filter((item): item is Destination => typeof item === "object" && item !== null)
      .map((item) => ({
        id: item._id,
        name: item.name,
        address: item.location?.address || item.location?.name,
        arrivalDate: item.arrivalDate,
        departureDate: item.departureDate,
      }));
  }, [selectedTrip?.destinations]);

  const hasOutOfBoundsStays = useMemo(() => {
    if (!selectedTrip || !accommodations || accommodations.length === 0) return false;
    return accommodations.some((acc) =>
      isDateRangeOutOfBounds(acc.checkIn, acc.checkOut, selectedTrip.startDate, selectedTrip.endDate)
    );
  }, [selectedTrip, accommodations]);

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

  const handleCreateExpenseDraft = (accommodation: Accommodation) => {
    if (!tripId) return;
    const nights =
      accommodation.checkIn && accommodation.checkOut
        ? Math.max(
            1,
            Math.ceil(
              (new Date(accommodation.checkOut).getTime() - new Date(accommodation.checkIn).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 1;
    const amount =
      accommodation.pricePerNight !== undefined ? Number((accommodation.pricePerNight * nights).toFixed(2)) : 0;

    const draft = {
      title: accommodation.name || "Stay expense",
      amount,
      category: "Accommodation",
      notes: accommodation.notes || undefined,
      date: accommodation.checkIn || new Date().toISOString().split("T")[0],
    };

    window.sessionStorage.setItem(`nomadly:budgetExpenseDraft:${tripId}`, JSON.stringify(draft));
    navigate(`/trips/${tripId}/budget`);
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

      <FormAlert
        show={hasOutOfBoundsStays}
        message="Some stays on this itinerary are scheduled outside the overall trip dates."
        variant="warning"
      />

      {stayInsights.length > 0 && (
        <div className="space-y-2">
          {stayInsights.map((insight, index) => (
            <div
              key={`${insight.message}-${index}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                insight.level === "warning"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              {insight.message}
            </div>
          ))}
        </div>
      )}

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
          onCreateExpenseDraft={handleCreateExpenseDraft}
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
        destinationSuggestions={destinationSuggestions}
        tripStartDate={selectedTrip?.startDate}
        tripEndDate={selectedTrip?.endDate}
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
