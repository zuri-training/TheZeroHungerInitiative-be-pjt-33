const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const learnMoreButton = $('#learn-more');
const donateButton = $('#donate');

learnMoreButton.addEventListener('click', () => {
  $('.about').scrollIntoView();
})

donateButton.addEventListener('click', () => {
  $('.donate-food').scrollIntoView();
})