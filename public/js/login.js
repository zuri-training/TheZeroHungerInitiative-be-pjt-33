//const devUrl = "http://localhost:5000/api/v1";
//const prodUrl = "https://zero-hunger-initiative.herokuapp.com/api/v1";


class Login {
  constructor() {
    this.initDOMElement();
    console.log("hello");
  }
  
  initDOMElement() {
    this.loginButton = document.querySelector(".login-mobile");
    //this.loginSubmit = document.querySelector(".submit-mobile");
    this.loginButtonDesktop = document.querySelector(".login");
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Login button
    //this.loginSubmit.addEventListener("submit", (e) => this.loginHandler(e));
    this.loginButton.addEventListener("click", (e) => this.loginHandler(e));
    this.loginButtonDesktop.addEventListener("click", (e) => this.loginHandlerDesktop(e));
  }
  
  loginDetails() {
    const username = document.querySelector("#username-mobile").value;
    const password = document.querySelector("#password-mobile").value;
  
    return {username, password};
  }
  
  loginDetailsDesktop() {
    const username = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
  
    return {username, password};
  }
  
  async loginHandler(e) {
    e.preventDefault();
    
    const {username, password} = this.loginDetails();
    
    // Loading state
    this.loginButton.innerHTML = `<div class="lds-hourglass"></div>`;
   
    try {
      alert("start");
      // Make an http request to the api
      const res = await axios({
        method: 'POST',
        url: `api/v1/users/login`,
        data: {
          username,
          password
        }
      });
      
      /*const res = await axios.post("http://localhost:5000/api/v1/users/login", {
        username,
        password
      })*/
      
      console.log(res);
      
      alert("after");
      alert(JSON.stringify(res));
      
      // if everything is ok
      /*if(res.data.status === "success") {
        alert("Login Successfully");
        
        window.setTimeout(() => {
          location.assign('/signup');
        }, 1000);
      }*/
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
      
      this.loginButton.textContent = `Login`;
    }
  }
  
  async loginHandlerDesktop(e) {
    e.preventDefault();
    
    // Get username and password
    const {username, password} = this.loginDetailsDesktop();
    
    // Loading state
    this.loginButtonDesktop.innerHTML = `<div class="lds-hourglass"></div>`;
    
    try {
      // Make an http request to the api
      const res = await axios({
        method: 'POST',
        url: `/api/v1/users/login`,
        data: {
          username,
          password
        }
      });
      
      // if everything is ok
      if(res.data.status === "success") {
        //const {iat, exp, user} = res.data;
        alert("Login Successfully");
        
        window.setTimeout(() => {
          location.assign('/signup');
        }, 1000);
      }
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
      
      this.loginButtonDesktop.textContent = `Login`;
    }
  }
  
}

new Login();