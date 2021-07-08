const login = (req, res) => {
  res.status(200).render('login');
};

const signup = (req, res) => {
  res.status(200).render('signup');
};

const forgotPassword = (req, res) => {
  res.status(200).render('forgot-password');
};

const resetPassword = (req, res) => {
  res.status(200).render('reset-password');
};

const forgotPasswordSuccess = (req, res) => {
  res.status(200).render('forgot-password-success');
};

const home = (req, res) => {
  console.log(req.page);
  res.status(200).render('home/index');
}
const team = (req, res) => {
  res.status(200).render('home/our-team', {title: 'Our Team'});
}; 
const volunteer = (req, res) => {
  res.status(200).render('home/volunteer-signup', {title: 'Become a volunteer'});
}; 
module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
  forgotPasswordSuccess,
  home,
  team,
  volunteer
};