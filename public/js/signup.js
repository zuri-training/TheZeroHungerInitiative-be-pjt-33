const devUrl = "http://localhost:5000/api/v1";
//const prodUrl = "https://zero-hunger-initiative.herokuapp.com/api/v1";


class Signup {
  constructor(url) {
    this.url = url;
    this.initDOMElement();
    console.log("hello");
  }
  
  initDOMElement() {
    this.signupButton = document.querySelector(".sign-up-mobile");
    this.signupButtonDesktop = document.querySelector(".signup-desktop");
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Login button
    this.signupButton.addEventListener("click", (e) => this.signupHandler(e));
    this.signupButtonDesktop.addEventListener("click", (e) => this.signupHandlerDesktop(e));
  }
  
  signupDetails() {
    const firstName = document.querySelector("#firstname-mobile").value;
    const lastName = document.querySelector("#lastname-mobile").value;
    const username = document.querySelector("#username-mobile").value;
    const gender = document.querySelector("#gender-mobile").value;
    const address = document.querySelector("#address-mobile").value;
    const email = document.querySelector("#email-mobile").value;
    const phoneNumber = document.querySelector("#phonenumber-mobile").value;
    const password = document.querySelector("#password-mobile").value;
    const passwordConfirm = document.querySelector("#password-confirm-mobile").value;
  
    return {firstName, lastName, username, address, email, phoneNumber, gender, password, passwordConfirm};
  }
  
  signupDetailsDesktop() {
    const firstName = document.querySelector("#firstName").value;
    const lastName = document.querySelector("#lastName").value;
    const username = document.querySelector("#username").value;
    const gender = document.querySelector("#gender").value;
    const address = document.querySelector("#userAddress").value;
    const email = document.querySelector("#email").value;
    const phoneNumber = document.querySelector("#phoneNumber").value;
    const password = document.querySelector("#userPassword").value;
    const passwordConfirm = document.querySelector("#confirmPassword").value;
  
    return {firstName, lastName, username, address, email, phoneNumber, gender, password, passwordConfirm};
  }
  
  
  async signupHandler(e) {
    e.preventDefault();
    // Get username and password
    const {firstName, lastName, username, address, email, phoneNumber, gender, password, passwordConfirm} = this.signupDetails();
    //console.log(firstName, lastName, username, address, email, phoneNumber, gender, password, passwordConfirm);
   
    // Loading state
    this.signupButton.innerHTML = `<div class="lds-hourglass"></div>`;
    
    try {
      // Make an http request to the api
      const res = await axios({
        method: 'POST',
        url: `${this.url}/users/signup`,
        data: {
          firstName,
          lastName,
          username,
          email,
          address,
          gender,
          phoneNumber,
          password,
          passwordConfirm
        }
      });
 
      alert("done")
      alert(res)
      // if everything is ok
      /*if(res.data.status === "success") {
        const {iat, exp, user} = res.data;
        alert("Signup Successfully");
        
        window.setTimeout(() => {
          location.assign('/dashboard.html');
        }, 1000);
      }*/
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
      
      this.signupButton.textContent = `Signup`;
    }
  }
  
  async signupHandlerDesktop(e) {
    e.preventDefault();
    // Get username and password
    const {firstName, lastName, username, address, email, phoneNumber, gender, password, passwordConfirm} = this.signupDetailsDesktop();
    //console.log(firstName, lastName, username, address, email, phoneNumber, gender, password, passwordConfirm);
   
    // Loading state
    this.signupButtonDesktop.innerHTML = `<div class="lds-hourglass"></div>`;
    
    try {
      // Make an http request to the api
      const res = await axios({
        method: 'POST',
        url: `${this.url}/users/signup`,
        data: {
          firstName,
          lastName,
          username,
          email,
          address,
          gender,
          phoneNumber,
          password,
          passwordConfirm
        }
      });
      //console.log(res);
      
      // if everything is ok
      /*if(res.data.status === "success") {
        const {iat, exp, user} = res.data;
        alert("Signup Successfully");
        
        window.setTimeout(() => {
          location.assign('/dashboard.html');
        }, 1000);
      }*/
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
      
      this.signupButtonDesktop.textContent = `Signup`;
    }
  }
  
  
}

new Signup(devUrl);