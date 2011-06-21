/**
 * iCalendar Feed Dashlet.
 * 
 * @namespace Alfresco
 * @class Alfresco.dashlet.ICalFeed
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $combine = Alfresco.util.combinePaths;


   /**
    * Dashboard ICalFeed constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.ICalFeed} The new component instance
    * @constructor
    */
   Alfresco.dashlet.ICalFeed = function ICalFeed_constructor(htmlId)
   {
      return Alfresco.dashlet.ICalFeed.superclass.constructor.call(this, "Alfresco.dashlet.ICalFeed", htmlId);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Alfresco.dashlet.ICalFeed, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * The component id.
          *
          * @property componentId
          * @type string
          * @default ""
          */
         componentId: "",
         
         /**
          * URL location of the iCal feed
          * 
          * @property feedUrl
          * @type string
          * @default ""
          */
         feedUrl: "",
         
         /**
          * Maximum number of events to show in the dashlet
          * 
          * @property numItems
          * @type int
          * @default 10
          */
         numItems: ""
      },
      
      /**
       * Title DOM container.
       * 
       * @property titleContainer
       * @type object
       * @default null
       */
      titleContainer: null,
      
      /**
       * Body DOM container.
       * 
       * @property bodyContainer
       * @type object
       * @default null
       */
      bodyContainer: null,

      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady: function ICalFeed_onReady()
      {
         // The body container
         this.bodyContainer = Dom.get(this.id + "-body");

         // The title container
         this.titleContainer = Dom.get(this.id + "-title");
         
         Event.addListener(this.id + "-config-link", "click", this.onConfigClick, this, true);
         
         // Render the contents
         this.refresh();
      },

      /**
       * Refresh the contents of the dashlet
       * 
       * @method refresh
       */
      refresh: function Notice_refresh()
      {
         if (this.options.feedUrl)
         {
            // Delegate loading the data
            this.load();
         }
         else
         {
            this.titleContainer.innerHTML = this.msg("label.title");
            this.bodyContainer.innerHTML = "<div>" + this.msg("msg.not-configured") + "</div>";
         }
      },

      /**
       * Load data and render into the dashlet
       * 
       * @method load
       */
      load: function ICalFeed_loadPosts()
      {
         // Load the data
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/ical-feed/data/" + this.options.componentId,
            successCallback:
            {
               fn: this.onLoadSuccess,
               scope: this
            },
            failureCallback:
            {
               fn: this.onLoadFailed,
               scope: this
            },
            scope: this,
            noReloadOnAuthFailure: true
         });
      },
      
      /**
       * Data loaded successfully
       * 
       * @method onLoadSuccess
       * @param p_response {object} Response object from request
       */
      onLoadSuccess: function ICalFeed_onLoadSuccess(p_response)
      {
         this.titleContainer.innerHTML = this.msg("label.title-feed", p_response.json.calendar.name);
         var events = p_response.json.events, event, lastEvent, isSameDay;
         if (events.length > 0)
         {
            var html = "";
            for ( var i = 0; i < events.length; i++)
            {
               event = events[i];
               // Parse the dates and sort
               event.dtstart.value = new Date(event.dtstart.value);
               event.dtend.value = new Date(event.dtend.value);
               events.sort(this.sortByEventDate);
               
               isSameDay = lastEvent != null && (event.dtstart.value.getFullYear() == lastEvent.dtstart.value.getFullYear() && 
                     event.dtstart.value.getMonth() == lastEvent.dtstart.value.getMonth() &&
                     event.dtstart.value.getDate() == lastEvent.dtstart.value.getDate());
               if (!isSameDay)
               {
                  html += (i > 0) ? "</div></div>\n" : "";
                  html += "<div class=\"detail-list-item\">\n" + 
                     "<div class=\"icon\"><img alt=\"day\" src=\"/share/res/components/calendar/images/calendar-16.png\"></div>\n" + 
                     "<div class=\"details2\"><h4>" + Alfresco.util.formatDate(event.dtstart.value, "mediumDate") + "</h4>\n";
               }
               html += "<div><span>" +
                  (event.dtstart.type == "date-time" ? Alfresco.util.formatDate(event.dtstart.value, "shortTime") + " - " + Alfresco.util.formatDate(event.dtend.value, "shortTime") + " " : "") + 
                  (event.url ? "<a href=\"" + event.url + "\">" + event.summary + "</a>" : event.summary) + 
                  "</span></div>\n";
               lastEvent = event;
            }
            html += "</div></div>\n";
            this.bodyContainer.innerHTML = html;
         }
      },
      
      /**
       * Data loading failed
       * 
       * @method onLoadFailed
       * @param p_response {object} Response object from request
       */
      onLoadFailed: function ICalFeed_onLoadFailed(p_response)
      {
         this.titleContainer.innerHTML = this.msg("label.title");
         this.bodyContainer.innerHTML = "<div>" + this.msg("msg.error") + "</div>";
      },

      /**
       * Sort iCal events by date
       * 
       * @method sortByEventDate
       * @param ev1 {object} Object representing the first event
       * @param ev2 {object} Object representing the second event
       * @return {int} -1 if ev1 after post2, 1 if before, 0 if the same
       */
      sortByEventDate: function ICalFeed_sortByEventDate(ev1, ev2)
      {
         return (ev1.dtstart > ev2.dtstart) ? -1 : (ev1.dtstart < ev2.dtstart) ? 1 : 0;
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */
      
      /**
       * Config dialog click handler
       *
       * @method onConfigClick
       * @param e {object} HTML event
       */
      onConfigClick: function ICalFeed_onConfigClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/ical-feed/config",
               actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function ICalFeed_onConfigFeed_callback(response)
                  {
                     // Refresh the feed
                     this.options.feedUrl = Dom.get(this.configDialog.id + "-feed-url").value;
                     this.refresh();
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function ICalFeed_doSetupForm_callback(form)
                  {
                     Dom.get(this.configDialog.id + "-feed-url").value = this.options.feedUrl;
                  },
                  scope: this
               }
            });
         }
         else
         {
            this.configDialog.setOptions(
            {
               actionUrl: actionUrl
            });
         }
         
         this.configDialog.show();
      }
   });
})();
