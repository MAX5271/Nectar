const success = (data, message = 'OK') => ({ status: 'success', message, data });
const error = (msg = 'Error', code = 500) => ({ status: 'error', message: msg, code });

module.exports = { success, error };
