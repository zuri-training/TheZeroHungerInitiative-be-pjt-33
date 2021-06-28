const paystack = (request) => {
  const initializePayment = (data, functionCallback) => {
    const options = {
      url : 'https://api.paystack.co/transaction/initialize',
      headers : {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: data
    }

    const callback = (error, response, body) => functionCallback(error, body);
    request.post(options, callback);
  }

  const verifyPayment = (ref, functionCallback) => {
    const options = {
      url : 'https://api.paystack.co/transaction/verify/'+encodeURIComponent(ref),
      headers : {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }

    const callback = (error, response, body) => functionCallback(error, body);
    request(options,callback);
  }

  return { initializePayment, verifyPayment };
}

module.exports = paystack;