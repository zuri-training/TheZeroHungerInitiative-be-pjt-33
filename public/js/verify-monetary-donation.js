const $ = document.querySelector.bind(document);

const getURLParameters = (url = window.location.search) => {
  return (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce((a, v) => (
    (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a
  ), {})
}

$('.app-loader').classList.add('visible');

(async () => {
  const { trxref } = getURLParameters();
  if (typeof trxref === undefined || trxref === undefined) {
    return window.location.href = '/donor/donations';
  }

  try {
    const res = await axios({
      url: `/api/v1/donate/monetary/verify/${trxref}`
    });

    if (res.data.status === 'success') {
      showMessageAndRedirect(`${res.data.message}`, 'success', '/donor/donations');
    }
  } catch (e) {
    if (!e.response && e.message === 'Network Error') {
      $('body').classList.remove('js-loader');
      $('.app-loader').classList.remove('visible');

      return iziToast.error({
        title: 'Error:', position: 'topCenter', timeout: 3e3,
        message: 'Network error. Please check your internet connection.'
      });
    }

    showMessageAndRedirect(`${e.response.data.message}`, 'error', '/donor/donations');
  }
})();

const showMessageAndRedirect = (message, type, url) => {
  switch (type) {
    case 'success':
      iziToast.success({ title: 'Error:', position: 'topCenter', timeout: 3e3, message });
      break;
    case 'error':
      iziToast.error({ title: 'Error:', position: 'topCenter', timeout: 3e3, message });
      break;
  }

  setTimeout(() => {
    iziToast.info({
      message: `Redirecting to dashboard...`, position: 'topCenter', timeout: null
    });

    window.location.href = `${url}`;
  }, 3e3);
}