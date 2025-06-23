# imitation of this https://github.com/TooTallNate/node-vorbis/blob/master/common.gypi
{
  'variables': {
    'node_xmljs': '<!(node -e "console.log(JSON.stringify(require(\'path\').dirname(require.resolve(\'libxmljs2\'))))")',
    'xmljs_include_dirs': [
      '<(node_xmljs)/src/',
      '<(node_xmljs)/vendor/libxml',
      '<(node_xmljs)/vendor/libxml/include'
    ],
    'conditions': [
      ['OS=="win"', {
        'xmljs_libraries': [
          '<(PRODUCT_DIR)/xmljs.lib'
        ],
      }, {
        'xmljs_libraries': [
          '<(node_xmljs)/build/$(BUILDTYPE)/xmljs.node'
        ],
        'library_dirs': [
          '<(node_xmljs)/build/$(BUILDTYPE)'
        ],
      }],
    ],
  },
}