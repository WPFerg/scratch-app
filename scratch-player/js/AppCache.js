// projectID is passed in via the node server.
var $ = require('jquery');
var cookie = require('cookie-cutter');
var scratch = require("./Scratch");

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
            $("#preloader").fadeOut();

            // Mark the app as downloaded in the cookie
            // Check to see if it exists, if it doesn't, create.
            if(typeof(cookie.get("installedApps")) === "undefined")
            {
                // If it doesn't, create it
                // When the AppCache gets the data, it adds to this pre-existing cookie.
                cookie.set("installedApps", "", {expires: new Date("Jan 1, 2050").toUTCString(), path:"/"});
            } else {
                var appList = cookie.get("installedApps");

                // If the app list is empty, the app cann be added to the installed apps since none are installed.
                // When it's cached, reload the page so the player works.
                if(appList === "")
                {
                    cookie.set("installedApps", projectId, {expires: new Date("Jan 1, 2050").toUTCString(), path:"/"});
                    showInfoMessage();
                    window.reload();
                } else {
                    // The cookie is a CSV list of project IDs. Parse this to see if the project already exists in the installed app.
                    var apps = appList.split(","),
                        appIsInstalled = false;

                    // Check each installed app to see if it is the current app
                    for(var appIndex in apps)
                    {
                        var app = apps[appIndex];
                        // See if this app is the current one
                        // Convert into ints so they're the both the correct types
                        if(app === projectId)
                        {
                            appIsInstalled = true;
                        }
                    }

                    // if the app isn't installed, add it to the cookie
                    if(!appIsInstalled)
                    {
                        cookie.set("installedApps", appList + "," + projectId, {expires: new Date("Jan 1, 2050").toUTCString(), path:"/"});
                        showInfoMessage();
                        location.reload();
                    }
                }

            }
        }

        appCache.onnoupdate = function(e) {
            $("#preloader").fadeOut();
            // Do nothing.
        }

        appCache.onupdateready = function(e) {
            console.log("Updating AppCache");
            appCache.swapCache();
            appCache.oncached(e);
            $("#preloader").fadeOut();
        }

        appCache.onchecking = function(e) {
            $("#preloader-caption").text("Checking for updates...");
        }

        appCache.onerror = function(e) {
            showInfoMessage("Error checking or downloading updates.");
            $("#preloader").fadeOut();
        }

        appCache.onobsolete = function(e) {
            // Nothing
        }

        return;
    }
}

showInfoMessage = function(text) {
    // Check if text exists, and replace if necessary.
    if(text !== "" || typeof(text) !== "undefined")
    {
        $(".install-message").text(text);
    }
    $(".install-message").fadeIn();

    setTimeout(function() { $(".install-message").fadeOut(); }, 10000)
}