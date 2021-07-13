const $q = document.querySelector.bind(document);

const form = $q('form');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const data = new URLSearchParams(new FormData(e.target).entries());
  const id = location.pathname.split('/').pop();

  $q('body').classList.add('js-loader');
  $q('.app-loader').classList.add('visible');
  $q('.big-button').setAttribute('disabled', 'disabled');

  try {
    const res = await axios({
      method: 'PATCH', url: `/api/v1/users/${id}`, data
    });

    if (res.data.status === 'success') {
      iziToast.success({
        message: 'User successfully updated!', position: 'topCenter', timeout: 3e3
      });

      setTimeout(() => {
        $q('.app-loader').classList.remove('visible');

        window.location.href = '/admin/users';
      }, 3e3);
    }
  } catch (e) {
    if (!e.response && e.message === 'Network Error') {
      $q('body').classList.remove('js-loader');
      $q('.app-loader').classList.remove('visible');

      return iziToast.error({
        title: 'Error:', position: 'topCenter', timeout: 3e3,
        message: 'Network error. Please check your internet connection.',
        onClosing: () => $q('.big-button').removeAttribute('disabled')
      });
    }
    
    iziToast.error({
      title: 'Error', position: 'topCenter', timeout: 3e3,
      message: `${e.response.data.message}`,
      onClosing: () => $q('.big-button').removeAttribute('disabled')
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

    $q('body').classList.remove('js-loader');
    $q('.app-loader').classList.remove('visible');
  }
})