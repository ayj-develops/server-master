const { default: slugify } = require('slugify');

const slugit = ({ name }) => {
  slugify(name, { lower: true });
};

exports.slugit = slugit;
