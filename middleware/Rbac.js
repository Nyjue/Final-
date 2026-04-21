// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Role '${req.user.role}' does not have access to this resource`
      });
    }
    
    next();
  };
};

// Check if user owns a resource or is admin
const checkOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Admin can access anything
      if (req.user.role === 'admin') {
        return next();
      }
      
      const ownerId = await getResourceOwnerId(req);
      
      if (req.user.id !== ownerId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You can only access your own resources'
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorize, checkOwnership };