/**
 * Create slug from provided text.
 * Slug strips package name and method prefix.
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
  return slug;
}

exports.slug = slug;
