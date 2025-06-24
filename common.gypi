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
        'libraries': [
          '<(PRODUCT_DIR)/xmljs.lib'
        ],
      }, {
        'libraries': [
          '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'build\', process.env.npm_config_build_type || \'Release\', \'xmljs.node\')")'
        ],
        'library_dirs': [
          '<!(node -p "require(\'path\').join(require(\'path\').dirname(require.resolve(\'libxmljs2\')), \'build\', process.env.npm_config_build_type || \'Release\')")'
        ],
      }],
    ],
  },
}