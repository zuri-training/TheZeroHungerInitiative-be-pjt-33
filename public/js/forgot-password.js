const devUrl = "http://localhost:5000/api/v1";
const prodUrl = "https://zero-hunger-initiative.herokuapp.com/api/v1";


class ForgotPassword {
  constructor(url) {
    this.url = url;
    this.initDOMElement();
    console.log("hello");
  }
  
  initDOMElement() {
    this.forgotPassButton = document.querySelector(".button-mobile");
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Login button
    this.forgotPassButton.addEventListener("click", (e) => this.forgotPassHandler(e));
  }
  
  forgotPassDetails() {
    const email = document.querySelector("#email").value;
  
    return {email};
  }
  
  
  async forgotPassHandler(e) {
    e.preventDefault();
    // Get username and password
    const {email} = this.forgotPassDetails();
    
    // Loading state
    this.forgotPassButton.innerHTML = `<div class="lds-hourglass"></div>`;
    
    try {
      // Make an http request to the api
      const res = await axios({
        method: 'POST',
        url: `${this.url}/users/forgot-password`,
        data: {
          email
        }
      });
      //console.log(res);
      
      // if everything is ok
      if(res.data.status === "success") {
        window.setTimeout(() => {
        location.assign('/forgot-password-success.html');
      }, 100);
      }
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
      
      this.forgotPassButton.textContent = `Forgot Password`;
    }
  }
  
}

//new ForgotPassword(prodUrl);
new ForgotPassword(prodUrl);