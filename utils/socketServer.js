/**
 * Collaborative Group Cart WebSocket Socket Handler
 * Manages shared shopping rooms, live state broadcast, and peer notifications
 */

// In-memory shared room storage: roomId -> { cart: [], members: [] }
const rooms = new Map();

export const setupSocketServer = (io) => {
  io.on("connection", (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // 1. Join or Create a Group Room
    socket.on("join-cart-room", ({ roomId, user }) => {
      currentRoom = roomId;
      currentUser = user || "Anonymous Shopper";

      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          cart: [],
          members: new Map(),
        });
      }

      const roomData = rooms.get(roomId);
      roomData.members.set(socket.id, currentUser);

      // Send the current room's state to the joining user
      socket.emit("cart-state-synced", {
        cart: roomData.cart,
        memberCount: roomData.members.size,
      });

      // Broadcast to other peers that someone joined
      socket.to(roomId).emit("member-joined", {
        user: currentUser,
        memberCount: roomData.members.size,
      });

      console.log(`👥 [Socket.io] "${currentUser}" joined group cart room: ${roomId}`);
    });

    // 2. Synchronize Cart Changes Across All Room Members
    socket.on("sync-cart-action", ({ roomId, cart, action, item, user }) => {
      if (!roomId || !rooms.has(roomId)) return;

      const roomData = rooms.get(roomId);
      roomData.cart = cart;

      // Broadcast updated cart to all peers in the room
      socket.to(roomId).emit("cart-updated-by-peer", {
        cart: roomData.cart,
        action, // "add", "remove", "update-qty"
        item,
        user: user || currentUser,
      });
    });

    // 3. User disconnects or leaves room
    socket.on("disconnect", () => {
      if (currentRoom && rooms.has(currentRoom)) {
        const roomData = rooms.get(currentRoom);
        roomData.members.delete(socket.id);

        if (roomData.members.size === 0) {
          // Clean up empty room after 1 hour inactivity
          setTimeout(() => {
            if (rooms.has(currentRoom) && rooms.get(currentRoom).members.size === 0) {
              rooms.delete(currentRoom);
              console.log(`🧹 [Socket.io] Cleaned up inactive group cart room: ${currentRoom}`);
            }
          }, 3600000);
        } else {
          socket.to(currentRoom).emit("member-left", {
            user: currentUser,
            memberCount: roomData.members.size,
          });
        }
      }
    });
  });
};
