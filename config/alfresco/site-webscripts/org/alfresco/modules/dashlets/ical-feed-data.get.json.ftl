{
   "calendar": {
      "name": "${calendar.name!''?js_string}",
      "description": "${calendar.description!''?js_string}"
   },
   "events" : [
   <#list events as e>
      {
         "dtstart": {
            "type": "${e.dtstart.type}",
            "value": "${e.dtstart.value?datetime?string("EEEE, MMMM dd, yyyy, hh:mm:ss a ZZ")?js_string}"
         },
         "dtend": {
            "type": "${e.dtend.type}",
            "value": "${e.dtend.value?datetime?string("EEEE, MMMM dd, yyyy, hh:mm:ss a ZZ")?js_string}"
         },
         "summary": "${e.summary!''?js_string}",
         "location": "${e.location!''?js_string}",
         "uid": "${e.uid!''?js_string}",
         "url": "${e.url!''?js_string}",
         "dtstamp": "${e.dtstamp!''?js_string}"
      }<#if e_has_next>,</#if>
   </#list>
   ]
}