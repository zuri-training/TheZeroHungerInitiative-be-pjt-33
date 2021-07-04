const addConnectedUser = (usersArray, userId, socketId) => {
  console.log(usersArray);
  const user = usersArray.find((user) => user.userId === userId);
  
  user === undefined ? usersArray.push({userId, socketId}) : user.socketId = socketId;
};


const removeConnectedUser = (usersArray, socketId) => {
  return usersArray.filter((user) => user.socketId !== socketId);
};

const getCurrentUser = (usersArray, userId) => {
   return usersArray.find((user) => user.userId === userId);
};



module.exports = {
  addConnectedUser,
  removeConnectedUser,
  getCurrentUser
};