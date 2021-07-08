const $q = document.querySelector.bind(document);

const form = $q('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new URLSearchParams(new FormData(e.target).entries());

  $q('body').classList.add('js-loader');
  $q('.app-loader').classList.add('visible');
  $q('#pay').setAttribute('disabled', 'disabled');

  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/donate/monetary',
      data
    });

    if (res.data.status === 'success') {
      iziToast.success({
        message: `${res.data.data.message}`, position: 'topCenter', timeout: 3e3
      });

      setTimeout(() => {
        iziToast.info({
          message: `Redirecting to payment provider...`, position: 'topCenter', timeout: 3e3
        });
        
        setTimeout(() => {
          window.location.href = res.data.data.data.authorization_url;
          iziToast.info({
            message: `You can now close this window.<br>You'll be redirected back after the transaction.`, position: 'topCenter', timeout: null
          });
        }, 2e3);
      }, 1e3);
    }
  } catch (e) {
    if (!e.response && e.message === 'Network Error') {
      $q('body').classList.remove('js-loader');
      $q('.app-loader').classList.remove('visible');

      return iziToast.error({
        title: 'Error:', position: 'topCenter', timeout: 3e3,
        message: 'Network error. Please check your internet connection.',
        onClosing: () => $q('#pay').removeAttribute('disabled'),
      });
    }

    iziToast.error({
      title: 'Error:', position: 'topCenter', timeout: 3e3,
      message: `${e.response.data.message}`,
      onClosing: () => $q('#pay').removeAttribute('disabled')
    });

    $q('body').classList.remove('js-loader');
    $q('.app-loader').classList.remove('visible');
  }
});