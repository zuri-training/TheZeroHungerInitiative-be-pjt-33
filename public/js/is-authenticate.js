const isAuthenticated = () => {
  const exp = localStorage.getItem("exp");
  const now = Date.now()/1000;
  
  if(exp > now) {
    return;
  }
  
  location.assign('/index.html');
  localStorage.setItem("user", "");
  localStorage.setItem("exp", "");
};

isAuthenticated();