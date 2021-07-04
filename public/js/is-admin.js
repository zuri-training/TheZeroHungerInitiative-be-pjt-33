const isAdmin = () => {
  const user =  JSON.parse(localStorage.getItem("user"));
  
  if(user.role !== "admin") {
    location.assign('/index.html');
  }
};

isAdmin();