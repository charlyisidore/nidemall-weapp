function isValidPhone(str) {
  const regex = /^[1][3,4,5,7,8][0-9]{9}$/;
  if (!regex.test(str)) {
    return false;
  } else {
    return true;
  }
}

module.exports = {
  isValidPhone,
};
