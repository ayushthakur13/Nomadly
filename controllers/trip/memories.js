const { cloudinary } = require('../../utils/cloudinary');
const Trip = require('../../models/trip');

module.exports.postUpdateTripCoverImage = async (req, res) => {
    const { tripId } = req.params;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found or Unauthorized' });

        if (trip.imageUrl && !trip.imageUrl.includes('/images/default-trip.jpg')) {
            const publicId = trip.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`Nomadly/TripCovers/${publicId}`);
        }

        trip.imageUrl = req.file.path;
        await trip.save();

        res.json({ success: true, imageUrl: trip.imageUrl });
    } 
    catch (err) {
        console.error('Failed to update trip cover:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports.postDeleteTripCoverImage = async (req, res) => {
    const { tripId } = req.params;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

        if (trip.imageUrl && !trip.imageUrl.includes('/images/default-trip.jpg')) {
            const publicId = trip.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`Nomadly/TripCovers/${publicId}`);
        }

        trip.imageUrl = '/images/default-trip.jpg';
        await trip.save();

        res.json({ success: true, imageUrl: trip.imageUrl });
    } 
    catch (err) {
        console.error('Failed to delete trip cover image:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


module.exports.postAddMemory = async (req, res) => {
    const { tripId } = req.params;
    const { caption } = req.body;

    try {
        const trip = await Trip.findOne({ 
            _id: tripId, 
            $or: [{ createdBy: req.user._id }, { participants: req.user._id }]
        });

        if (!trip) 
            return res.status(404).json({ success: false, message: 'Trip not found' });

        if (!req.file) 
            return res.status(400).json({ success: false, message: 'No image uploaded' });

        const memory = {
            url: req.file.path,
            uploadedBy: req.user._id,
            caption
        };

        trip.memories.push(memory);
        await trip.save();

        const added = trip.memories[trip.memories.length - 1];
        res.json({ success: true, memory: added });
    } 
    catch (err) {
        console.error('Failed to add memory:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports.postDeleteMemory = async (req, res) => {
    const { tripId } = req.params;
    const { memoryId } = req.body;

    try {
        const trip = await Trip.findOne({
            _id: tripId,
            $or: [{ createdBy: req.user._id }, { participants: req.user._id }]
        });

        if (!trip)
            return res.status(404).json({ success: false, message: 'Trip not found' });

        const memory = trip.memories.id(memoryId);
        if (!memory)
            return res.status(404).json({ success: false, message: 'Memory not found' });

        if (!trip.createdBy.equals(req.user._id) && !memory.uploadedBy.equals(req.user._id)) 
            return res.status(403).json({ success: false, message: 'Not authorized to delete this memory' });

        if (memory.url && memory.url.includes('res.cloudinary.com')) {
            const publicId = memory.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`Nomadly/Memories/${publicId}`);
        }

        memory.deleteOne();
        await trip.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete memory:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
