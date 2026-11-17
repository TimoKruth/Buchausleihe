# Local security fork of Picomatch 4.0.7

Upstream: https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz
Tarball integrity: `sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==`
Advisory: https://github.com/advisories/GHSA-fc5q-39xc-vjpf

On 2026-11-17, upstream has no patched release. This private, source-vendored
fork retains the upstream MIT license and API. The root npm override replaces
all Picomatch 2/3/4 copies with this reviewed local source; npm ci requires no
postinstall mutation or remote fork. The distinct package name and securityPatch
metadata identify this as a repository patch, not an official upstream release.

The only runtime change is in lib/parse.js. Single-branch repeated extglobs
whose bodies contain glob syntax now use the parser's existing safe literal
fallback, after its existing safe character-class simplifications. This closes
the nested unbounded repetition in patterns such as +(*) and +(*a). Ordinary
wildcards, multi-branch extglobs, plain repeated literals, and safely flattened
character repetitions retain upstream behavior. Complex single-branch repeated
extglobs may now match literally; callers must not disable the upstream
maxExtglobRecursion safeguard. This fork is for repository tooling, not the
application browser bundle.

Regression tests exercise the reported attacks in subprocesses with timeouts,
public matching/scanning APIs, and representative consumer file selection.
Replace this directory and override with an official release once one fixes
the advisory and passes these tests. Never merely rename a vulnerable release
to clear an advisory.
