# imitation of this https://github.com/TooTallNate/node-vorbis/blob/master/common.gypi
{
  'target_defaults': {
    'include_dirs': [
      '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'src\')")',
      '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'vendor\', \'libxml\')")',
      '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'vendor\', \'libxml\', \'include\')")'
    ],
    'conditions': [
      ['OS=="win"', {
        # Link against libxmljs2's import library in its own build dir, resolved
        # via require.resolve. Using <(PRODUCT_DIR)/xmljs.lib pointed at this
        # addon's build dir, where xmljs.lib never exists -> LNK1181.
        'libraries': [
          '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'build\', process.env.npm_config_build_type || \'Release\', \'xmljs.lib\')")'
        ],
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