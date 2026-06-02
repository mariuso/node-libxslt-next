{
  "targets": [
    {
      "target_name": "node-libxslt",
      "sources": [ "src/node_libxslt.cc", "src/stylesheet.cc" ],
      "include_dirs": ["<!(node -e \"require('nan')\")"],
      'dependencies': [
      	'./deps/libxslt.gyp:libxslt',
      	'./deps/libxslt.gyp:libexslt'
      ],
      'conditions': [
        # On Windows there is no dynamic symbol resolution like Linux/macOS, so
        # node-libxslt must link against an import library for libxmljs2's addon.
        # Build libxmljs2's xmljs target into our PRODUCT_DIR (which produces
        # xmljs.lib next to xmljs.node) and link against it.
        ['OS=="win"', {
          'dependencies': [
            '<(node_xmljs)/binding.gyp:xmljs'
          ],
          'libraries': [
            '<(PRODUCT_DIR)/xmljs.lib'
          ]
        }]
      ]
    }
  ]
}