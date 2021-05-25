const users = [];

// add user to the users array
const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate data
  if (!username || !room) {
    return {
      error: "Username and Room are required",
    };
  }

  // check existing user
  const existingUser = users.find((e) => {
    return e.username === username && e.room === room;
  });

  //  validate username
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  //  store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// remove user
const removeUser = (id) => {
  const temp = users.findIndex((e) => e.id === id);
  if (temp === -1) return "User not found";
  return users.splice(temp, 1)[0];
};

// getUser
const getUser = (id) => {
  return users.find((e) => e.id === id);
};
// getUserInRoom
const getUserInRoom = (room) => {
  if (!room) return;
  room = room.trim().toLowerCase();
  return users.filter((e) => e.room === room);
};

// export
module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
};
