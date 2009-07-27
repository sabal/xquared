/**
 * @requires Xquared.js
 * @requires Browser.js
 * @requires Editor.js
 * @requires plugin/Base.js
 * @requires ui/Control.js
 */
xq.plugin.LinkToImagePlugin = xq.Class(xq.plugin.Base,
	/**
	 * @name xq.plugin.LinkToImagePlugin
	 * @lends xq.plugin.LinkToImagePlugin.prototype
	 * @extends xq.plugin.Base
	 * @constructor
	 */
	{
	onAfterLoad: function(xed) {
		xed.config.defaultToolbarButtonGroups.link.push(
			{className:"linkToImage", title:xed._("Link to image"), handler:"xed.linkToImage.execute()"}
		)
		
		xed.addListener({
			onEditorBeforeEvent: function(xed, e) {
				if (e.type == 'mouseup' || e.type == 'contextmenu') {
					var element = (e.target)? e.target : e.srcElement;
					
					if (xed.linkToImage.currentImage === element) return;
					
					var isImage = element.nodeName == 'IMG';
					if (!isImage && xed.linkToImage.currentImage == null) return;
					
					xed.linkToImage.currentImage = (isImage)? element : null;
					
					if(xed.toolbar) xed.toolbar.enableButtons((isImage)? ['link']:['linkToImage']);
				}
			},
			onEditorInitialized: function(){
				if(xed.toolbar) xed.toolbar.enableButtons(['linkToImage']);
			}
		});
		
		xed.linkToImage = {
			currentImage: null,
			execute: function(editor, element){
				var image = xed.linkToImage.currentImage;
				if (!image || image.nodeName != 'IMG') return;
				xed.handleLink(image);
				
			},
			insert: function(url, className){
				var image = xed.linkToImage.currentImage;
				if (!image || image.nodeName != 'IMG') return;
				
				if(url) {
					var a;
					if (image.parentNode && image.parentNode.nodeName == 'A'){
						a = image.parentNode;
					} else {
						a = xed.rdom.wrapElement("a", image);
					}
					if(!url.match(/^(http|https|ftp|mailto):\/\//)) url = "http://" + url;
					a.href = url;
					if(image.alt) a.title = image.alt;
					if (className) a.className = className;
				}
			}
		}
	}
});