const EventBus = {
  publish: async (topic, data) => {
    console.log(`[EventBus] Publishing to ${topic}:`, data);
  },
  subscribe: (topic, callback) => {
    console.log(`[EventBus] Subscribing to ${topic}`);
  }
};

module.exports = EventBus;
