<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.ICalFeed("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "feedUrl": "${args.feedUrl!''}"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>

<div class="dashlet ical-feed-dashlet">
   <div class="title" id="${args.htmlid}-title"></div>
   <div class="toolbar">
      <a id="${args.htmlid}-config-link" class="theme-color-1" href="#">${msg("link.configure")}</a>
   </div>
   <div class="body scrollableList" id="${args.htmlid}-body" <#if args.height??>style="height: ${args.height}px;"</#if>>
   </div>
</div>