# imitation of this https://github.com/TooTallNate/node-vorbis/blob/master/common.gypi
{
  'variables': {
    # Directory of the installed libxmljs2 package. Used on Windows to build its
    # xmljs addon into our PRODUCT_DIR so xmljs.lib is available to link against.
    'node_xmljs': '<!(node -p "require(\'path\').dirname(require.resolve(\'libxmljs2\'))")',
  },
  'target_defaults': {
    'include_dirs': [
      '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'src\')")',
      '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'vendor\', \'libxml\')")',
      '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'vendor\', \'libxml\', \'include\')")'
    ],
    'conditions': [
      ['OS=="win"', {
        # Windows linking is handled on the node-libxslt target in binding.gyp:
        # it builds libxmljs2's xmljs target into our PRODUCT_DIR (producing
        # xmljs.lib) and links against it. Keeping that out of target_defaults
        # avoids the xmljs dependency target trying to link against itself.
      }, {
        'libraries': [
          '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'build\', process.env.npm_config_build_type || \'Release\', \'xmljs.node\')")'
        ],
        'library_dirs': [
          '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'build\', process.env.npm_config_build_type || \'Release\')")'
        ],
        'conditions': [
          # node-libxslt.node records a DT_NEEDED on the basename "xmljs.node".
          # glibc resolves that against the already-loaded libxmljs2 (index.js
          # requires libxmljs2 before this addon), so it works without an rpath.
          # musl (Alpine) instead resolves the basename via the runtime library
          # path, which has no entry for it -> ERR_DLOPEN_FAILED. Add an rpath so
          # the loader can find xmljs.node on musl. Both an absolute path (the
          # build-time location) and an $ORIGIN-relative path (survives moving
          # node_modules) are provided. macOS uses @loader_path instead of
          # $ORIGIN and already works like glibc, so this is Linux-only.
          ['OS=="linux"', {
            'ldflags': [
              '-Wl,-rpath,<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'build\', process.env.npm_config_build_type || \'Release\')")',
              '-Wl,-rpath,\'$$ORIGIN/../../../libxmljs2/build/Release\'',
            ],
          }],
        ],
      }],
    ],
  },
}