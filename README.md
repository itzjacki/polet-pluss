# polet-pluss
Extention that adds extra features to the vinmonopolet.no website

Can be found on the Chrome web store here:

https://chrome.google.com/webstore/detail/polet%20/ebkhfjjpghjiihkfkkihmnipgijmjbpi

The plan is to expand this readme more later™, but here is a basic run-through:

The extension aims to add extra functionality to the vinmonopolet.no website. It does this by automatially doing a Vivino search for a wine name, fetching the score from the top result, and displaying this on the vinmonopolet product page for said wine. This whole process is a bit cumbersome, but necessary since Vivino does not provide an open API for this (I do not plan on scraping all of Vivino regularly to create my own API, sorry).

## Manual installation

The extension has been submitted to the Chrome web store, and this readme will be updated when/if it is released on the web store. But the review can be a lengthy process, and there might have been technicalities I did not fulfill, so here is a guide on how to run the extension "in dev mode".

1. Download the repository, either by cloning it or by downloading the files as a zip. Unzip the files in a folder somewhere if you chose the latter.
2. Go to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Press the "Load unpacked" button in the top left
5. Navigate to the folder that has the files (specifically the one with `manifest.json`) in it, and select the folder
6. You should be good to go! Check the following section if you experience any issues

Navigate to the product page for any wine on vinmonopolet.no to see the results.

## Troubleshooting

I haven't done enormous amounts of testing of the extension, but here are a few things I've seen happening:
- Ad blockers can sometimes stop the extension from loading. I want to fix this, but for now just disabling adblock on vinmonopolet.no is a suitable solution, as the page doesn't have ads anyway.
- From time to time the element that is supposed to show the score doesn't load, a quick refresh usually fixes this
- On the product page of some products that have not been sold in a long time, the extension doesn't load. This is due to some of these old product pages lacking a description of the product, which is what the extension uses to decide where to insert the score element. There is no solution to this right now, sadly.
