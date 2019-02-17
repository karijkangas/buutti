/*
 *
 */
module.exports = {
  initialize: jest.fn().mockResolvedValue(true),
  shutdown: jest.fn().mockResolvedValue(true),
  set: jest.fn().mockResolvedValue(true),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(true),
};
