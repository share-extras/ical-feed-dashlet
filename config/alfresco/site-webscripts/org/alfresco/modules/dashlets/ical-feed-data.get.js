// Get the feed URL using url.templateArgs.componentId
function main()
{
   var component = sitedata.getComponent(url.templateArgs.componentId);
   if (component != null)
   {
      var feedUrl = component.properties.feedUrl;
      
      if (feedUrl != null && feedUrl.indexOf("http") == 0)
      {
         var connector = remote.connect("http"),
            result = connector.get(feedUrl);
         
         if (result.status == 200)
         {
            var lines = ("" + result.response).split(/\s*[\r\n]+\s*/), li, parts;
            var events = [], currEvent = null, calName = null, calDesc = null;
            for (var i = 0; i < lines.length; i++)
            {
               li = lines[i];
               parts = li.split(":");
               
               if (parts.length >= 2)
               {
                  if (parts[0] == "X-WR-CALNAME")
                  {
                     calName = parts[1];
                  }
                  else if (parts[0] == "X-WR-CALDESC")
                  {
                     calDesc = parts[1];
                  }
                  else if (li == "BEGIN:VEVENT")
                  {
                     currEvent = {};
                  }
                  else if (parts[0].indexOf("DTSTART") == 0)
                  {
                     // Datetime format, e.g. 19980119T070000Z
                     if (/^\d{8}T\d{6}Z$/.test(parts[1]))
                     {
                        currEvent.dtstart = {
                           type: "date-time",
                           value: new Date(parts[1].substring(0,4), //year
                              parts[1].substring(4,6), //month
                              parts[1].substring(6,8), //day
                              parts[1].substring(9,11), //hour
                              parts[1].substring(11,13), //minute
                              parts[1].substring(13,15) //second
                        )};
                     }
                     // Date format, e.g. 19980119
                     else if (/^\d{8}$/.test(parts[1]))
                     {
                        currEvent.dtstart = {
                           type: "date",
                           value: new Date(parts[1].substring(0,4), //year
                              parts[1].substring(4,6), //month
                              parts[1].substring(6,8) //day
                        )};
                     }
                  }
                  else if (parts[0].indexOf("DTEND") == 0)
                  {
                     // Datetime format, e.g. 19980119T070000Z
                     if (/^\d{8}T\d{6}Z$/.test(parts[1]))
                     {
                        currEvent.dtend = {
                           type: "date-time",
                           value: new Date(parts[1].substring(0,4), //year
                              parts[1].substring(4,6), //month
                              parts[1].substring(6,8), //day
                              parts[1].substring(9,11), //hour
                              parts[1].substring(11,13), //minute
                              parts[1].substring(13,15) //second
                        )};
                     }
                     // Date format, e.g. 19980119
                     else if (/^\d{8}$/.test(parts[1]))
                     {
                        currEvent.dtend = {
                           type: "date",
                           value: new Date(parts[1].substring(0,4), //year
                              parts[1].substring(4,6), //month
                              parts[1].substring(6,8) //day
                        )};
                     }
                  }
                  else if (parts[0] == "SUMMARY")
                  {
                     if (currEvent != null)
                     {
                        currEvent.summary = parts[1];
                     }
                  }
                  else if (parts[0] == "LOCATION")
                  {
                     if (currEvent != null)
                     {
                        currEvent.location = parts[1];
                     }
                  }
                  else if (parts[0] == "UID")
                  {
                     if (currEvent != null)
                     {
                        currEvent.uid = parts[1];
                     }
                  }
                  else if (parts[0] == "URL")
                  {
                     if (currEvent != null)
                     {
                        currEvent.url = parts[1] + ":" + parts[2];
                     }
                  }
                  else if (parts[0] == "DTSTAMP")
                  {
                     if (currEvent != null)
                     {
                        currEvent.dtstamp = parts[1];
                     }
                  }
                  else if (li == "END:VEVENT")
                  {
                     if (currEvent != null)
                     {
                        if (currEvent.dtstart &&
                              currEvent.dtend && currEvent.dtend.value.getTime() > Date.now())
                        {
                           events.push(currEvent);
                        }
                        currEvent = null;
                     }
                  }
               }
            }
            
            // Parse the iCal data
            model.calendar = {
                  name: calName,
                  description: calDesc
            };
            model.events = events;
            model.calData = result.response;
         }
         else
         {
            status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, "Error during remote call. " +
                  "Status: " + result.status + ", Response: " + result.response);
            status.redirect = true;
         }
      }
      else
      {
         status.setCode(status.STATUS_BAD_REQUEST, "No valid Feed URL was found");
         status.redirect = true;
      }
   }
}
main();