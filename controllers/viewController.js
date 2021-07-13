const { getUserDonation } = require('./monetaryDonationController');
const { fetchAdminDashboard, fetchAdminDonations, fetchAdminUsers, fetchAdminUser } = require('../utils/adminDataFetcher');

const login = (req, res) => {
  res.status(200).render('login');
}

const signup = (req, res) => {
  res.status(200).render('signup');
}

const forgotPassword = (req, res) => {
  res.status(200).render('forgot-password');
}

const resetPassword = (req, res) => {
  res.status(200).render('reset-password');
}

const forgotPasswordSuccess = (req, res) => {
  res.status(200).render('forgot-password-success');
}

const home = (req, res) => {
  res.status(200).render('home/index', { user: req.user });
}

const team = (req, res) => {
  res.status(200).render('home/our-team', { title: 'Our Team', user: req.user });
}
 
const volunteer = (req, res) => {
  res.status(200).render('home/volunteer-signup', { title: 'Become a Volunteer!', user: req.user });
}

const about = (req, res) => {
  res.status(200).render('home/about-us', { title: 'About Us', user: req.user });
}

const donorDashboard = async (req, res) => {
  // Get donor dashboard data & add them to the context variable
  const { foodDonation, cashDonation } = await getUserDonation(req.user);
  
  const context = {
    activePage: req.page,
    title: 'Dashboard', // By default
    user: JSON.parse(JSON.stringify(req.user)),
    foodDonation,
    cashDonation
  }

  switch (req.page) {
    case 'donations':
      context.title = 'Donations';
      res.status(200).render('donor/donations', context);
      break;
    case 'live-chat':
      context.title = 'Live Chat';
      res.status(200).render('donor/live-chat', context);
      break;
    default:
      res.status(200).render('donor/dashboard', context);
      break;
  }
}

const verifyMonetaryDonation = (req, res) => {
  res.status(200).render('donor/verify-monetary-donation');
}

const adminDashboard = async (req, res) => {
  // Get admin dashboard data & add them to the context variable
  
  // Right now, only static data is being shown to the admin
  let context = {
    activePage: req.page,
    title: 'Admin Dashboard', // By default
    user: JSON.parse(JSON.stringify(req.user))
  }

  switch (req.page) {
    case 'donations':
      const { foodDonations, cashDonations } = await fetchAdminDonations();
      
      context.title = 'All Donations';
      context = { ...context, foodDonations, cashDonations }
      res.status(200).render('admin/donations', context);
      break;
    case 'donation-stations':
      context.title = 'Donation Station';
      res.status(200).render('admin/donation-stations', context);
      break;
    case 'live-chat':
      context.title = 'Admin Live Chat';
      res.status(200).render('admin/live-chat', context);
      break;
    case 'users':
      const { allUsers } = await fetchAdminUsers();

      context.title = 'User Management';
      context = { ...context, allUsers }
      res.status(200).render('admin/users', context);
      break;
    case 'user-edit':
      const { userData } = await fetchAdminUser(req.params.id);

      context.title = 'Edit User';
      context = { ...context, userData }
      res.status(200).render('admin/user-edit', context);
      break;
    case 'user-new':
      context.title = 'Create User';
      res.status(200).render('admin/user-new', context);
      break;
    default:
      const {
        latestUsers,
        userCount,
        foodDonationCount,
        cashDonationCount,
        pendingChat,
        dispatchRiderCount
      } = await fetchAdminDashboard();

      context = {
        ...context,
        latestUsers,
        userCount,
        foodDonationCount,
        cashDonationCount,
        pendingChat,
        dispatchRiderCount
      };
      res.status(200).render('admin/dashboard', context);
      break;
  }
}

module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
  forgotPasswordSuccess,
  home,
  team,
  volunteer,
  about,
  donorDashboard,
  verifyMonetaryDonation,
  adminDashboard
}