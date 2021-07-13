const $q = document.querySelector.bind(document);

$q('.add-item').addEventListener('click', () => {
  const clonedNode = $q('.option-clone').cloneNode(true);
  clonedNode.classList.remove('d-none', 'option-clone');
  $q('.items-container').appendChild(clonedNode);
})

document.body.addEventListener('click', e => {
  if (e.target.matches('.remove-option')) {
    e.target.closest('.item-option').remove();
  }
})


const form = $q('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new URLSearchParams(new FormData(e.target).entries());

  $q('body').classList.add('js-loader');
  $q('.app-loader').classList.add('visible');
  $q('.big-button').setAttribute('disabled', 'disabled');

  try {
    const res = await axios({
      method: 'POST', url: '/api/v1/donate', data
    });

    if (res.data.status === 'success') {
      iziToast.success({
        message: `Food donation request made! You'll be contacted soon for more details`,
        position: 'topCenter', timeout: 4e3
      });

      setTimeout(() => {
        $q('.app-loader').classList.remove('visible');

        iziToast.success({
          message: 'Redirecting to donations...',
          position: 'topCenter', timeout: null
        });

        window.location.href = '/donor/donations';
      }, 3e3);
    }
  } catch (e) {
    if (!e.response && e.message === 'Network Error') {
      $q('body').classList.remove('js-loader');
      $q('.app-loader').classList.remove('visible');

      return iziToast.error({
        title: 'Error:',
        position: 'topCenter',
        timeout: 3e3,
        message: 'Network error. Please check your internet connection.',
        onClosing: () => $q('.big-button').removeAttribute('disabled'),
      });
    }

    iziToast.error({
      title: 'Error:',
      position: 'topCenter',
      timeout: 3e3,
      message: `${e.response.data.message}`,
      onClosing: () => $q('.big-button').removeAttribute('disabled'),
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
});

// {
//   "foodCategory": "raw food",
//   "deliveryOption": "pick-up",
//   "items": [
//     {
//       "description": "indomitable",
//       "metric": "kg",
//       "quantity": "12"
//     }
//   ],
//   "user": "userid",
//   "pickupDate": "2021-06-24",
//   "pickupAddress": "ondo",
//   "contactName": "Toheeb",
//   "contactPhoneNumber": "09020119024",
//   "localGovernment": "ondo",
//   "attachedDispatchRider": false,
//   "rider": "riderid"
// }
