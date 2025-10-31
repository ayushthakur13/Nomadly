const Trip = require('../../models/trip');
const { cloudinary } = require('../../utils/cloudinary');

/**
 * @route   GET /api/trips
 * @desc    Get all trips for authenticated user (created or participated)
 * @access  Private
 */
exports.getUserTrips = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, category, sort = 'createdAt', order = 'desc' } = req.query;

    const query = {
      $or: [
        { createdBy: userId },
        { participants: userId }
      ]
    };

    if (category) query.category = category;

    const trips = await Trip.find(query)
      .populate('createdBy', 'name username profilePic')
      .populate('participants', 'name username profilePic')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categorized = {
      upcoming: [],
      ongoing: [],
      past: [],
      all: trips
    };

    trips.forEach(trip => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);

      if (today < start) {
        categorized.upcoming.push(trip);
      } else if (today >= start && today <= end) {
        categorized.ongoing.push(trip);
      } else {
        categorized.past.push(trip);
      }
    });

    // Return based on status filter
    if (status && categorized[status]) {
      return res.json({
        success: true,
        trips: categorized[status],
        total: categorized[status].length
      });
    }

    res.json({
      success: true,
      trips: categorized,
      total: trips.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/trips
 * @desc    Create a new trip
 * @access  Private
 */
exports.createTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripName, mainDestination, startDate, endDate, category, description } = req.body;

    // Validation
    if (!tripName || !mainDestination || !startDate || !endDate || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tripName, mainDestination, startDate, endDate, category'
      });
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    // Create trip
    const trip = await Trip.create({
      tripName,
      mainDestination,
      startDate,
      endDate,
      category,
      description: description || '',
      createdBy: userId,
      participants: [userId]
    });

    // Populate and return
    await trip.populate('createdBy', 'name username profilePic');
    await trip.populate('participants', 'name username profilePic');

    res.status(201).json({
      success: true,
      trip: trip.toObject()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/trips/:tripId
 * @desc    Get single trip by ID
 * @access  Private
 */
exports.getTripById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await Trip.findOne({
      _id: tripId,
      $or: [
        { createdBy: userId },
        { participants: userId }
      ]
    })
      .populate('createdBy', 'name username profilePic email')
      .populate('participants', 'name username profilePic email')
      .lean();

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or access denied'
      });
    }

    // Add helper metadata
    trip.isOwner = trip.createdBy._id.toString() === userId;
    trip.memberCount = trip.participants.length;
    
    // Calculate task progress
    const totalTasks = trip.tasks?.length || 0;
    const completedTasks = trip.tasks?.filter(t => t.completed).length || 0;
    trip.taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate budget info
    const totalBudget = trip.budget?.total || 0;
    const expenses = trip.budget?.expenses || [];
    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    trip.budgetInfo = {
      total: totalBudget,
      spent,
      remaining: totalBudget - spent
    };

    res.json({
      success: true,
      trip
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/trips/:tripId
 * @desc    Update trip details
 * @access  Private (Owner only)
 */
exports.updateTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;
    const { tripName, mainDestination, startDate, endDate, category, description } = req.body;

    // Find trip and verify ownership
    const trip = await Trip.findOne({ _id: tripId, createdBy: userId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or you are not the owner'
      });
    }

    // Date validation if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({
          success: false,
          error: 'End date must be after start date'
        });
      }
    }

    // Update fields
    if (tripName) trip.tripName = tripName;
    if (mainDestination) trip.mainDestination = mainDestination;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (category) trip.category = category;
    if (description !== undefined) trip.description = description;

    await trip.save();
    await trip.populate('createdBy', 'name username profilePic');
    await trip.populate('participants', 'name username profilePic');

    res.json({
      success: true,
      trip: trip.toObject()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/trips/:tripId
 * @desc    Delete a trip
 * @access  Private (Owner only)
 */
exports.deleteTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await Trip.findOne({ _id: tripId, createdBy: userId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or you are not the owner'
      });
    }

    // Delete trip cover image from Cloudinary
    if (trip.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(trip.imagePublicId);
      } catch (cloudErr) {
        console.error('Failed to delete trip cover from Cloudinary:', cloudErr);
      }
    }

    // Delete all memory images from Cloudinary
    if (trip.memories && trip.memories.length > 0) {
      const deletePromises = trip.memories
        .filter(mem => mem.public_id)
        .map(mem => cloudinary.uploader.destroy(mem.public_id));
      
      try {
        await Promise.allSettled(deletePromises);
      } catch (cloudErr) {
        console.error('Failed to delete memories from Cloudinary:', cloudErr);
      }
    }

    // Delete trip
    await trip.deleteOne();

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/trips/:tripId/cover
 * @desc    Update trip cover image
 * @access  Private (Owner only)
 */
exports.updateTripCover = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await Trip.findOne({ _id: tripId, createdBy: userId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or you are not the owner'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Delete old cover image if exists
    if (trip.imagePublicId && !trip.imageUrl.includes('/images/default-trip.jpg')) {
      try {
        await cloudinary.uploader.destroy(trip.imagePublicId);
      } catch (cloudErr) {
        console.error('Failed to delete old cover:', cloudErr);
      }
    }

    // Update with new image
    trip.imageUrl = req.file.path;
    trip.imagePublicId = req.file.filename;
    await trip.save();

    res.json({
      success: true,
      imageUrl: trip.imageUrl
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/trips/:tripId/cover
 * @desc    Delete trip cover image (reset to default)
 * @access  Private (Owner only)
 */
exports.deleteTripCover = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await Trip.findOne({ _id: tripId, createdBy: userId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or you are not the owner'
      });
    }

    // Delete from Cloudinary
    if (trip.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(trip.imagePublicId);
      } catch (cloudErr) {
        console.error('Failed to delete cover from Cloudinary:', cloudErr);
      }
    }

    // Reset to default
    trip.imageUrl = '/images/default-trip.jpg';
    trip.imagePublicId = null;
    await trip.save();

    res.json({
      success: true,
      imageUrl: trip.imageUrl
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/trips/:tripId/publish
 * @desc    Publish trip (make public)
 * @access  Private (Owner only)
 */
exports.publishTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await Trip.findOne({ _id: tripId, createdBy: userId })
      .populate('createdBy', 'isPublic');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or you are not the owner'
      });
    }

    // Check if user's profile is public
    if (!trip.createdBy.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Your profile must be public to publish trips'
      });
    }

    trip.isPublic = true;
    await trip.save();

    res.json({
      success: true,
      message: 'Trip published successfully',
      isPublic: true
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/trips/:tripId/unpublish
 * @desc    Unpublish trip (make private)
 * @access  Private (Owner only)
 */
exports.unpublishTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await Trip.findOne({ _id: tripId, createdBy: userId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or you are not the owner'
      });
    }

    trip.isPublic = false;
    await trip.save();

    res.json({
      success: true,
      message: 'Trip unpublished successfully',
      isPublic: false
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/trips/:tripId/clone
 * @desc    Clone a public or featured trip
 * @access  Private
 */
exports.cloneTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    // Find original trip (must be public or featured)
    const originalTrip = await Trip.findOne({
      _id: tripId,
      $or: [{ isPublic: true }, { isFeatured: true }]
    }).lean();

    if (!originalTrip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or not available for cloning'
      });
    }

    // Prevent cloning own trips
    if (originalTrip.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot clone your own trip'
      });
    }

    // Clone trip data
    const {
      tripName, mainDestination, startDate, endDate,
      category, description, destinations, tasks,
      budget, accommodations, imageUrl, imagePublicId
    } = originalTrip;

    const clonedTrip = await Trip.create({
      tripName: `${tripName} (Copy)`,
      mainDestination,
      startDate,
      endDate,
      category,
      description,
      destinations,
      tasks: tasks.map(t => ({ title: t.title, completed: false })),
      budget: {
        total: budget?.total || 0,
        expenses: []
      },
      accommodations,
      imageUrl,
      imagePublicId,
      memories: [],
      createdBy: userId,
      participants: [userId],
      isPublic: false,
      isFeatured: false
    });

    await clonedTrip.populate('createdBy', 'name username profilePic');

    res.status(201).json({
      success: true,
      trip: clonedTrip.toObject(),
      message: 'Trip cloned successfully'
    });
  } catch (err) {
    next(err);
  }
};