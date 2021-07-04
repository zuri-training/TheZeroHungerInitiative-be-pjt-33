const devUrl = "http://localhost:5000/api/v1";
const prodUrl = "https://zero-hunger-initiative.herokuapp.com/api/v1";

//console.log(window.location);

class ResetPassword {
  constructor(url) {
    this.url = url;
    this.initDOMElement();
  }
  
  initDOMElement() {
    this.resetPassButton = document.querySelector(".submit-desktop");
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Login button
    this.resetPassButton.addEventListener("click", (e) => this.resetPassHandler(e));
  }
  
  resetPassDetails() {
    const password = document.querySelector("#newPassword").value;
    const passwordConfirm = document.querySelector("#re-enterPassword").value;
  
    return {password, passwordConfirm};
  }
  
  
  async resetPassHandler(e) {
    e.preventDefault();
    // Get username and password
    const {password, passwordConfirm} = this.resetPassDetails();
    
    // Loading state
    this.resetPassButton.innerHTML = `<div class="lds-hourglass"></div>`;
    
    try {
      // Make an http request to the api
      const res = await axios({
        method: 'POST',
        url: `${this.url}/users/reset-password/${window.location.search.split("=")[1]}`,
        data: {
          password,
          passwordConfirm
        }
      });
      //console.log(res);
      
      // if everything is ok
      if(res.data.status === "success") {
        alert("Password reset successful")
        window.setTimeout(() => {
        location.assign('/dashboard.html');
      }, 1000);
      }
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
      
      this.resetPassButton.textContent = `Reset Password`;
    }
  }
  
}

new ResetPassword(prodUrl);