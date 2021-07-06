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
      }, 3e3);
    }
  } catch (e) {
    iziToast.error({
      title: 'Error:', position: 'topCenter', timeout: 3e3,
      message: `${e.response.data.message}`,
      onClosing: () => $('.big-button').removeAttribute('disabled')
    });

    $('body').classList.remove('js-loader');
    $('.app-loader').classList.remove('visible');
  }
})