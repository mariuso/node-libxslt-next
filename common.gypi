# imitation of this https://github.com/TooTallNate/node-vorbis/blob/master/common.gypi
{
  'variables': {
    # Directory of the installed libxmljs2 package. Used on Windows to build its
    # xmljs addon into our PRODUCT_DIR so xmljs.lib is available to link against.
    'node_xmljs': '<!(node -p "require(\'path\').dirname(require.resolve(\'libxmljs2\'))")',
    # Same directory, but RELATIVE to the project root. gyp writes absolute paths
    # into the build files unquoted, so an absolute path containing spaces (e.g.
    # an install dir like "/x/sp ace/proj") breaks the compiler/linker. A relative
    # path stays under node_modules (no spaces) regardless of the parent dir. See #5.
    'node_xmljs_rel': '<!(node -p "var p=require(\'path\'); p.relative(process.cwd(), p.dirname(require.resolve(\'libxmljs2\')))")',
    'build_type%': "<!(node -p \"process.env.npm_config_build_type || 'Release'\")",
    # Path from this addon's build/Release to libxmljs2's build/Release, used as
    # an $ORIGIN-relative rpath. Computed (not hardcoded) so it is correct for
    # hoisted, nested and pnpm layouts, and relative so it stays space-safe.
    'xmljs_rpath_rel': '<!(node -p "var p=require(\'path\'); p.relative(p.join(process.cwd(), \'build\', \'Release\'), p.join(p.dirname(require.resolve(\'libxmljs2\')), \'build\', \'Release\'))")',
  },
  'target_defaults': {
    'include_dirs': [
      '<(node_xmljs_rel)/src',
      '<(node_xmljs_rel)/vendor/libxml',
      '<(node_xmljs_rel)/vendor/libxml/include'
    ],
    'conditions': [
      ['OS=="win"', {
        # Windows linking is handled on the node-libxslt target in binding.gyp:
        # it builds libxmljs2's xmljs target into our PRODUCT_DIR (producing
        # xmljs.lib) and links against it. Keeping that out of target_defaults
        # avoids the xmljs dependency target trying to link against itself.
      }, {
        'libraries': [
          # gyp auto-prefixes library_dirs with $(srcdir) but not a libraries
          # file input, so add it ourselves. srcdir is a relative path ("..") in
          # the generated Makefile, so this stays space-safe. (make generator,
          # i.e. Linux/macOS; Windows links via binding.gyp.)
          '$(srcdir)/<(node_xmljs_rel)/build/<(build_type)/xmljs.node'
        ],
        'library_dirs': [
          '<(node_xmljs_rel)/build/<(build_type)'
        ],
        'conditions': [
          # node-libxslt.node records a DT_NEEDED on the basename "xmljs.node".
          # glibc resolves that against the already-loaded libxmljs2 (index.js
          # requires libxmljs2 before this addon), so it works without an rpath.
          # musl (Alpine) instead resolves the basename via the runtime library
          # path, which has no entry for it -> ERR_DLOPEN_FAILED. Add an
          # $ORIGIN-relative rpath so the loader finds xmljs.node on musl. An
          # absolute rpath would break in install paths containing spaces (#5);
          # $ORIGIN keeps it relative and also survives moving node_modules.
          # macOS uses @loader_path and already works like glibc, so Linux-only.
          ['OS=="linux"', {
            'ldflags': [
              '-Wl,-rpath,\'$$ORIGIN/<(xmljs_rpath_rel)\'',
            ],
          }],
        ],
      }],
    ],
  },
}