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
      method: 'POST', url: 'api/v1/users/login', data
    });

    if (res.data.status === 'success') {
      iziToast.success({
        message: 'Login successful!', position: 'topCenter', timeout: 3e3
      });

      setTimeout(() => {
        $('.app-loader').classList.remove('visible');

        iziToast.success({
          message: 'Redirecting to dashboard...', position: 'topCenter', timeout: null
        });

        // Redirect to dashboard
        switch (res.data.user.role) {
          case 'donor':
            window.location.href = '/donor/dashboard';
            break;
          case 'volunteer':
            window.location.href = '/volunteer/dashboard';
            break;
          case 'admin':
            window.location.href = '/admin/dashboard';
            break;
        }
      }, 3e3);
    }
  } catch (e) {
    if (!e.response && e.message === 'Network Error') {
      $('body').classList.remove('js-loader');
      $('.app-loader').classList.remove('visible');

      return iziToast.error({
        title: 'Error:', position: 'topCenter', timeout: 3e3,
        message: 'Network error. Please check your internet connection.',
        onClosing: () => $('.big-button').removeAttribute('disabled')
      });
    }
    
    iziToast.error({
      title: 'Error:', position: 'topCenter', timeout: 3e3,
      message: `${e.response.data.message}`,
      onClosing: () => $('.big-button').removeAttribute('disabled')
    });

    $('body').classList.remove('js-loader');
    $('.app-loader').classList.remove('visible');
  }
})

// Show error messages from BackEnd
const errors = $$('.error');

if (errors.length) {
  errors.forEach(error => {
    iziToast.error({
      title: 'Error:', position: 'topCenter', timeout: 3e3, message: error.innerText
    });
  })
}