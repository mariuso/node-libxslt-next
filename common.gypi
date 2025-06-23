# imitation of this https://github.com/TooTallNate/node-vorbis/blob/master/common.gypi
{
  'variables': {
    'conditions': [
      ['OS=="win"', {
        'node_xmljs': '<!(node -e "console.log(require(\'path\').dirname(require.resolve(\'libxmljs2\')))")',
        'xmljs_include_dirs': [
          '<(node_xmljs)/src/',
          '<(node_xmljs)/vendor/libxml',
          '<(node_xmljs)/vendor/libxml/include'
        ],
        'xmljs_libraries': [
          '<(node_xmljs)/build/Release/xmljs.lib'
        ],
      }, {
        'node_xmljs': '<!(node -p "require(\'path\').dirname(require.resolve(\'libxmljs2\'))")',
        'xmljs_include_dirs': [
          '<(node_xmljs)/src/',
          '<(node_xmljs)/vendor/libxml',
          '<(node_xmljs)/vendor/libxml/include'
        ],
        'xmljs_libraries': [
          '<(node_xmljs)/build/$(BUILDTYPE)/xmljs.node',
          '-Wl,-rpath,<(node_xmljs)/build/$(BUILDTYPE)'
        ],
      }],
    ],
  },
}