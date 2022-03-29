async function makeApiCall(options = {}) {
  const defaults = {
    url: '',
    method: 'GET',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  };

  // merge options with defalut values
  Object.assign(defaults, options);

  // make api call
  try {
    if (!defaults.url) throw new Error('URL required')

    const response = await fetch(defaults.url, defaults);
    return await response.json();
  } catch (error) {
    return error;
  }
}

export default makeApiCall;
