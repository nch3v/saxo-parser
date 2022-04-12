# Changelog


## [1.0.1] - 2016-03-25
- Initial release

## [1.1.0] - 2022-04-12
- bump dependencies
- handle error and return the first one in done callback (might break your code if you deal with malformed xml)
- handle CDATA nodes treating them as text node (using the same handler)

