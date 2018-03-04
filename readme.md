# Pa11y Crawler

A wrapper around [Pa11y](https://github.com/pa11y/pa11y) to crawl links from the start page and log the results. Not meant as a long term project, more a quick stopgap until [Sidekick](https://github.com/pa11y/sidekick) is ready.

Also built to scratch my own itch - to run tests against various projects, log the results, and maybe to show off some pretty stats one day!

For now - clone the repo. In the future, maybe, npm install might become a thing!

## TODOS

* [ ] split logs into per project dirs.
* [ ] save results to log after page run, it takes too long to run the tests on all of them, lots of chances to fail out.
* [ ] Split out the crawling part to generate a list of pages (essentially a sitemap!).
* [ ] run pa11y tests on pages in parallel.
* [ ] set a limit to the number of page tests that can run in parallel.
