/**
 * @requires Xquared.js
 * @requires Browser.js
 * @requires Editor.js
 * @requires plugin/Base.js
 * @requires ui/Control.js
 */
xq.plugin.FileUploadPlugin = xq.Class(xq.plugin.Base,
	/**
	 * @name xq.plugin.FileUploadPlugin
	 * @lends xq.plugin.FileUploadPlugin.prototype
	 * @extends xq.plugin.Base
	 * @constructor
	 */
	{
	onAfterLoad: function(xed) {
		xed.config.defaultToolbarButtonGroups.insert.push(
			{className:"image", title:"Upload Image", handler:"xed.handleFileUpload()"}
		)
				
		xed.insertImageFileToEditor = function(fileName, xed){
			xed = xed || this;
			
			var img = xed.getDoc().createElement('IMG');
			img.src = fileName;
			
			xed.focus();
			xed.rdom.insertNode(img) ;
		}
		
		xed.fileUploadTarget = "uploaded.html";
		
		xed.setUploadTarget = function(target)
		{
			xed.fileUploadTarget = target;
		}
		
		xed.handleFileUpload = function() {
		
			var dialog = new xq.ui.FormDialog(
				this,
				xq.ui_templates.basicFileUploadDialog,
				function(dialog) {
					document.getElementById("fileUploadDialog").action = xed.fileUploadTarget;
				},
				function(dialog) {
					xed.focus();
				
					if(xq.Browser.isTrident) {
						var rng = xed.rdom.rng();
						rng.moveToBookmark(bm);
						rng.select();
					}
					
					this.form.submit();
					return true;
				}
			);
			
			this.fileUploadListener.dialog = dialog;
			if(xq.Browser.isTrident) var bm = this.rdom.rng().getBookmark();
			dialog.show({position: 'centerOfEditor', notSelfClose: true});
			
			return true;
		}
		xed.fileUploadListener = {
			dialog: null,
			onComplete: function(index, result){
				if (document.getElementById("uploadTarget")){
					
					//Response page: ../uploaded.html 
					var ret = document.getElementById("uploadTarget").contentWindow.document.body.innerHTML;
					var data = eval("("+ret+")");
					
					if(data.success) {
						xed.insertImageFileToEditor(data.file_name, window.parent.xed);
						this.dialog.close();
					} else {
						alert("Upload Failed");
					}	
				}
			}
		}
	}
});