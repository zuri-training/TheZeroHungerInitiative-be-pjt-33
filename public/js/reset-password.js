const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const getURLParameters = (url = window.location.search) => {
  return (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce((a, v) => (
    (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a
  ), {})
}

const form = $('form');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const data = new URLSearchParams(new FormData(e.target).entries());
  const { token } = getURLParameters();

  $('.big-button').setAttribute('disabled', 'disabled');
  $('body').classList.add('js-loader');
  $('.app-loader').classList.add('visible');

  try {
    const res = await axios({
      method: 'POST', url: `api/v1/users/reset-password/${token}`, data
    });

    if (res.data.status === 'success') {
      iziToast.success({
        message: `Password reset successfully!`, position: 'topCenter', timeout: 3e3
      });

      setTimeout(() => {
        $('body').classList.remove('js-loader');
        $('.app-loader').classList.remove('visible');

        iziToast.success({
          message: `Redirecting to login...`, position: 'topCenter', timeout: null
        });

        window.location.href = '/login';
      }, 3e3);
    }
  } catch (e) {
    // console.log(e.response.data);

    iziToast.error({
      title: 'Error:', position: 'topCenter', timeout: 3e3,
      message: `${e.response.data.message}`,
      onClosing: () => $('.big-button').removeAttribute('disabled')
    });

    $('body').classList.remove('js-loader');
    $('.app-loader').classList.remove('visible');
  }
})