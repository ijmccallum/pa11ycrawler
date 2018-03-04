"use strict";
const pa11y = require("pa11y");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const entryUrl = "http://www.wikilogicfoundation.org/";
const pageLimit = 10;
const logDir = makePathAbsolute("./log");
/*
I'm pretty sure recursion in JS isn't yet a solved problem (the growing stack issue),
so instead I've gone for a slightly more complicated iterative approach, 
just in case you want to run this on a really really deep / convoluted site
*/
let untestedPages = [
  {
    url: entryUrl,
    results: {}
  }
];
let testedPages = [];

async function begin(url) {
  console.log(1);
  while (untestedPages.length > 0 && testedPages.length <= pageLimit) {
    console.log(2);
    //TODO: await this, otherwise it goes MAD!
    for (const page of untestedPages) {
      console.log(3);
      if (!isPageInMap(page, testedPages)) {
        console.log(4);
        //if this page is not in the tested pages map
        //test it
        const results = await pa11yPage(page.url);
        console.log(results);
        //add it to the tested pages map
        testedPages.push({
          url: page.url,
          results: results
        });
        //get the links from this page
        let links = await getLinksFromPage(page.url);
        //add them to the untested pages map
        links.forEach(link => {
          if (typeof link == "undefined") {
            return;
          }
          //only child page
          if (link.indexOf(entryUrl) == -1) {
            console.log(`Not testing: ${link}`);
            return;
          }
          //don't retest pages
          if (isPageInMap({ url: link }, testedPages)) {
            return;
          }
          untestedPages.push({
            url: link,
            results: {}
          });
        });
      }
      //remove from untested pages (if there are dupes, they will all be removed)
      untestedPages = removePageFromMap(page, untestedPages);
    }
  }
  console.log("testedPages", testedPages);
  //TODO: save results, into pa11y results folder then use that to drive a UI?
  if (!isDirectory(logDir)) {
    console.log("Making Dir");
    ensureFolderAddress(logDir);
  }
  var logFileName = generateLogFilename(logDir);
  console.log("logFileName", logFileName);
  fs.writeFile(logFileName, JSON.stringify(testedPages), function(err) {
    console.log("log fail", err);
  });
}

function generateLogFilename(logDir) {
  let logAddress = logDir;
  if (logAddress.slice(-1) != "/") {
    logAddress += "/";
  }
  return (logAddress += Date.now() + ".json");
}

function getLinksFromPage(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? require("https") : require("http");
    lib.get(url, response => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        resolve([]);
      }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on("data", chunk => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on("end", () => {
        let $ = cheerio.load(body.join(""));
        let returnLinks = [];
        let links = $("a"); //jquery get all hyperlinks
        $(links).each(function(i, link) {
          returnLinks.push($(link).attr("href"));
        });
        resolve(returnLinks);
      });
    });
  });
}

function isPageInMap(testPage, pageMap) {
  pageMap.forEach(mapPage => {
    if (mapPage.url == testPage.url) {
      return true;
    }
  });
  return false;
}

function removePageFromMap(removalPage, pageMap) {
  let returnableageMap = pageMap.slice(0);
  returnableageMap.forEach((mapPage, i) => {
    if (mapPage.url == removalPage.url) {
      returnableageMap.splice(i, 1);
    }
  });
  return returnableageMap;
}

/**
 * Takes an address
 * Returns true if that address points to a folder
 */
function isDirectory(sourceAddres) {
  return fs.lstatSync(sourceAddres).isDirectory();
}

function makePathAbsolute(relativePath) {
  const absPath = path.resolve(relativePath);
  return absPath;
}

/**
 * Takes a folder address
 * Makes it if it doesn't exist already
 */
function ensureFolderAddress(folderAddress) {
  if (!fs.existsSync(folderAddress)) {
    fs.mkdirSync(folderAddress);
  }
  return folderAddress;
}

//return a promise / resolve to a results object
function pa11yPage(url) {
  return new Promise((resolve, reject) => {
    try {
      pa11y(url, {
        log: {
          debug: console.log,
          error: console.error,
          info: console.log
        }
      })
        .then(results => {
          resolve(results);
        })
        .catch(err => {
          resolve(err);
        });
    } catch (err) {
      resolve(err);
    }
  });
}

begin(entryUrl);
