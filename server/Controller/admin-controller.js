const User = require('../Models/user-model');

const getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called');
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    const users = await User.find({}, '-password'); // exclude password
    console.log('Found users:', users.length);
    console.log('Users data:', users);
    
    res.status(200).json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.status(200).json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};
