const notificationService = require('../services/notificationService');

async function listNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotifications(req.user);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
}

async function clearNotifications(req, res, next) {
  try {
    const result = await notificationService.clearNotifications(req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listNotifications,
  clearNotifications,
};
