const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const form = $('form');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const data = new URLSearchParams(new FormData(e.target).entries());

  $('body').classList.add('js-loader');
  $('.app-loader').classList.add('visible');
  $('.big-button').setAttribute('disabled', 'disabled');

  try {
    const res = await axios({
      method: 'POST', url: 'api/v1/users/signup', data
    });

    if (res.data.status === 'success') {
      console.log(res.data);
      const { firstName, role } = res.data.user;
      iziToast.success({
        message: `You've signed up successfully as a <b>${role}</b>!`, position: 'topCenter', timeout: 3e3
      });

      setTimeout(() => {
        $('.app-loader').classList.remove('visible');

        iziToast.success({
          message: `Hi, <b>${firstName}</b>! You'll be redirected to the dashboard shortly.`, position: 'topCenter', timeout: null
        });
        
        // Redirect to dashboard
      }, 3e3);
    }
  } catch (e) {
    if (!e.response && e.message === 'Network Error') {
      $('body').classList.remove('js-loader');
      $('.app-loader').classList.remove('visible');

      return iziToast.error({
        title: 'Error:', position: 'topCenter', timeout: 3e3,
        message: 'No internet connection. Please check your network.',
        onClosing: () => $('.big-button').removeAttribute('disabled')
      });
    }
    
    iziToast.error({
      title: 'Error', position: 'topCenter', timeout: 3e3,
      message: `${e.response.data.message}`,
      onClosing: () => $('.big-button').removeAttribute('disabled')
    });

    if (e.response.data?.details) {
      const errorDetails = e.response.data.details;

      if (e.response.data.message !== 'A record exists with some of your entered values') {
        Object.keys(errorDetails).forEach(field => {
          iziToast.warning({
            title: 'Error:', position: 'topCenter', timeout: 3e3, message: `${errorDetails[field]}`
          });
        })
      } else {
        Object.keys(errorDetails).forEach(field => {
          iziToast.warning({
            title: `Please choose another ${field}`, position: 'topCenter', timeout: 3e3
          });
        })
      }
    }

    $('body').classList.remove('js-loader');
    $('.app-loader').classList.remove('visible');
  }
})