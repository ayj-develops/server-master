const checkExist = (variable) => {
  if (variable === undefined || variable === null) {
    return false;
  }
  return true;
};

exports.checkExist = checkExist;
