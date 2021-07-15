const $q = document.querySelector.bind(document);

const form = $q('form');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const data = new URLSearchParams(new FormData(e.target).entries());
  location.href.match('/admin/') && data.append('isAdmin', true);

  $q('body').classList.add('js-loader');
  $q('.app-loader').classList.add('visible');
  $q('.big-button').setAttribute('disabled', 'disabled');

  try {
    const res = await axios({
      method: 'POST', url: '/api/v1/users/signup', data
    });

    if (res.data.status === 'success') {
      console.log(res.data);
      const { firstName, role } = res.data.user;
      if (!res.data.isAdmin) {
        iziToast.success({
          message: `You've signed up successfully as a <b>${role}</b>!`, position: 'topCenter', timeout: 3e3
        });

        setTimeout(() => {
          $q('.app-loader').classList.remove('visible');

          iziToast.success({
            message: `Hi, <b>${firstName}</b>! You'll be redirected to the dashboard shortly.`, position: 'topCenter', timeout: null
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
      } else {
        iziToast.success({
          message: 'User created successfully!', position: 'topCenter', timeout: 3e3,
          onClosing: () => (window.location.href = '/admin/users')
        });
      }
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