// projectID is passed in via the node server.
$ = require('jquery');

exports.listen = function()
{
    // Check to see if the project id exists
    if(projectId === "")
    {
        alert("No project ID.");
    } else {
        
        // If so, set the HTML manifest to the manifest file.
        var appCache = window.applicationCache;
        
        // Bind events for the app cache status updates. 
        appCache.onprogress = function(e) {
            $(".downloading-text").text("Downloading: " + e.loaded + "/" + e.total);
        }

        appCache.oncached = function(e) {
            $(".downloading-text").text("Downloaded!");
            $(".downloading-text").slideUp();
        }

        appCache.onnoupdate = function(e) {
            // Do nothing.

            $(".downloading-text").remove();
        }

        appCache.onupdateready = function(e) {
            console.log("Updating AppCache");
            appCache.swapCache();
            appCache.oncached(e);
        }

        appCache.onchecking = function(e) {
            $(".downloading-text").text("Checking for updates...");
        }

        appCache.onerror = function(e) {
            $(".downloading-text").text("Error checking or downloading updates.");
            $(".downloading-text").slideUp();
        }

        appCache.onobsolete = function(e) {
            $(".player-loading").css({display: "none"});
            $(".player-container").css({display: "block"});
        }

        return;
    }
}