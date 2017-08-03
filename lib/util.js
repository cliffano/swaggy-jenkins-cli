/**
 * Create slug from provided text.
 * Slug strips package name, method prefix, and non alphanumeric characters.
 *
 * @param {String} text: source text
 * @return {String} slug
 */
function slug(text) {
  var slug;
  if (text.indexOf('.') !== -1) {
    slug = text.substring(text.lastIndexOf('.') + 1, text.length);
  } else if (text.startsWith('get')) {
    slug = text.replace('get', '');
  } else {
    slug = text;
  }
  slug = slug.replace(/[\W_]+/g, '');
  return slug;
}

exports.slug = slug;
