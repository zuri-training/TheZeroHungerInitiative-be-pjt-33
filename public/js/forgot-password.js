const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const form = $('form');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const data = new URLSearchParams(new FormData(e.target).entries());

  $('.big-button').setAttribute('disabled', 'disabled');
  $('body').classList.add('js-loader');
  $('.app-loader').classList.add('visible');

  try {
    const res = await axios({
      method: 'POST', url: 'api/v1/users/forgot-password', data
    });

    if (res.data.status === 'success') {
      iziToast.success({
        message: `${res.data.message}`, position: 'topCenter', timeout: 3e3
      });

      setTimeout(() => {
        $('body').classList.remove('js-loader');
        $('.app-loader').classList.remove('visible');
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