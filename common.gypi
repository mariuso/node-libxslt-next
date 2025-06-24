# imitation of this https://github.com/TooTallNate/node-vorbis/blob/master/common.gypi
{
  'variables': {
    'node_xmljs%': '<!(node -p "require(\'path\').dirname(require.resolve(\'libxmljs2\'))")',
  },
  'target_defaults': {
    'include_dirs': [
      '<(node_xmljs)/src',
      '<(node_xmljs)/vendor/libxml',
      '<(node_xmljs)/vendor/libxml/include'
    ],
    'conditions': [
      ['OS=="win"', {
        'libraries': [
          '<(PRODUCT_DIR)/xmljs.lib'
        ],
      }, {
        'libraries': [
          '<(node_xmljs)/build/<(CONFIGURATION_NAME)/xmljs.node'
        ],
        'library_dirs': [
          '<(node_xmljs)/build/<(CONFIGURATION_NAME)'
        ],
      }],
    ],
  },
}