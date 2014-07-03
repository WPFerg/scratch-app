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
            $("#preloader-caption").text("Downloading: " + e.loaded + "/" + e.total);
            $("#preloader-progress-bar").width(e.loaded * 100 / e.total + "%");
        }

        appCache.oncached = function(e) {
            $("#preloader-caption").text("Downloaded!");
        }

        appCache.onnoupdate = function(e) {
            // Do nothing.
        }

        appCache.onupdateready = function(e) {
            console.log("Updating AppCache");
            appCache.swapCache();
            appCache.oncached(e);
        }

        appCache.onchecking = function(e) {
            $("#preloader-caption").text("Checking for updates...");
        }

        appCache.onerror = function(e) {
            $("#preloader-caption").text("Error checking or downloading updates.");
        }

        appCache.onobsolete = function(e) {
            // Nothing
        }

        return;
    }
}