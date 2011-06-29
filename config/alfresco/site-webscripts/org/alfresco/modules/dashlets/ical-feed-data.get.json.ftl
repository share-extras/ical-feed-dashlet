<#macro dateFormat date>${date?string("dd MMM yyyy HH:mm:ss 'GMT'Z '('zzz')'")}</#macro>
<#escape x as jsonUtils.encodeJSONString(x)>
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
            "value": "<@dateFormat e.dtstart.value />"
         },
         "dtend": {
            "type": "${e.dtend.type}",
            "value": "<@dateFormat e.dtend.value />"
         },
         "summary": "${e.summary!''}",
         "location": "${e.location!''}",
         "uid": "${e.uid!''}",
         "url": "${e.url!''}",
         "dtstamp": "${e.dtstamp!''}"
      }<#if e_has_next>,</#if>
   </#list>
   ]
}
</#escape>