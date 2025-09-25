const Contact = require('../Models/contact-model');

// Get all contact messages (admin only)
exports.getAllContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        
        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        // Priority filter
        if (req.query.priority) {
            filter.priority = req.query.priority;
        }
        
        // Subject filter
        if (req.query.subject) {
            filter.subject = req.query.subject;
        }
        
        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }
        
        // Search query
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        
        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const totalContacts = await Contact.countDocuments(filter);
        const totalPages = Math.ceil(totalContacts / limit);
        
        res.status(200).json({
            success: true,
            count: contacts.length,
            totalContacts,
            totalPages,
            currentPage: page,
            contacts
        });
    } catch (error) {
        console.error('Error in getAllContacts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a single contact message by ID (admin only)
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        res.status(200).json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Error in getContactById:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo, note } = req.body;
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        // Update fields if provided
        if (status) contact.status = status;
        if (priority) contact.priority = priority;
        if (assignedTo) contact.assignedTo = assignedTo;
        
        // Add note if provided
        if (note) {
            contact.notes.push({
                text: note,
                createdBy: req.user._id
            });
        }
        
        await contact.save();
        
        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            contact
        });
    } catch (error) {
        console.error('Error in updateContactStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Add response to contact (admin only)
exports.addContactResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { responseText } = req.body;
        
        if (!responseText) {
            return res.status(400).json({
                success: false,
                message: 'Response text is required'
            });
        }
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        // Add response
        contact.response = {
            text: responseText,
            sentAt: new Date(),
            sentBy: req.user._id
        };
        
        // Update status to resolved if not already closed
        if (contact.status !== 'closed') {
            contact.status = 'resolved';
        }
        
        await contact.save();
        
        // In a real application, you would send an email to the user with the response
        
        res.status(200).json({
            success: true,
            message: 'Response added successfully',
            contact
        });
    } catch (error) {
        console.error('Error in addContactResponse:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get contact messages for a specific user (customer)
exports.getUserContacts = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        const contacts = await Contact.find({ email })
            .sort({ createdAt: -1 })
            .select('name email message subject status response createdAt updatedAt');
            
        res.status(200).json({
            success: true,
            count: contacts.length,
            contacts
        });
    } catch (error) {
        console.error('Error in getUserContacts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete contact message (admin only)
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        await Contact.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteContact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get contact statistics (admin only)
exports.getContactStats = async (req, res) => {
    try {
        const totalContacts = await Contact.countDocuments();
        const newContacts = await Contact.countDocuments({ status: 'new' });
        const inProgressContacts = await Contact.countDocuments({ status: 'in_progress' });
        const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });
        const closedContacts = await Contact.countDocuments({ status: 'closed' });
        
        // Count by subject
        const subjectCounts = await Contact.aggregate([
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Count by priority
        const priorityCounts = await Contact.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            stats: {
                totalContacts,
                byStatus: {
                    new: newContacts,
                    inProgress: inProgressContacts,
                    resolved: resolvedContacts,
                    closed: closedContacts
                },
                bySubject: subjectCounts,
                byPriority: priorityCounts
            }
        });
    } catch (error) {
        console.error('Error in getContactStats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
