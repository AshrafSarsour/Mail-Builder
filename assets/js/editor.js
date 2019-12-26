(function($){
	/*****************************************************************
	 * Here starting main functionality of mail builder
	**/ 
    var textEditor,
        MediumEditorHook ={ 
            clean : function(){
                (function(e){
                    var editor = $(e);
                    editor.each(function(){
                        $(this)  .removeAttr('contenteditable')
                                 .removeAttr('spellcheck')
                                 .removeAttr('data-medium-editor-element')
                                 .removeAttr('role')
                                 .removeAttr('aria-multiline')
                                 .removeAttr('data-medium-editor-editor-index')
                                 .removeAttr('medium-editor-index')
                                 .removeAttr('data-placeholder')
                                 .removeClass('medium-editor-element');
                    });
                }('.medium-editor-element'));
            }
        },
        /**
         * Clear tooltip
        **/
        totalCleaner = function(){
            
            $('.tooltip-editor').remove();

            $('.editable-open, .editable').find('tbody > tr > td').popover('destroy');

            $($('.editable-open, .editable').find('tbody > tr > td > table > tbody > tr')).popover('destroy');
            
            $('*[data-toggle^="popover"]').each(function(){
                $(this)  .removeAttr('data-toggle')
                         .removeAttr('data-content')
                         .removeAttr('data-container')
                         .removeAttr('data-original-title')
                         .removeAttr('title')
            });
        }
    
	/* Global Selectors */
	var mb = {
		chooseTemplate : $('#choose-template'),
		optionTabs : $('#option-tabs'),
		mailTemplate : $('#mail-template'),
		editor : $("#editor"),
		tools : $("#settings"),

		
	};
	
	$.fn.info = function(message, type, offset){
		type = type || 'info';
		offset = offset || 0;
		$id = $.rand(10000,99999);
		var $this = this;
		$this.append('<div class="alert alert-' + type + '" id="alert-'+$id+'"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>').promise().done(function(){
			setTimeout(function(){
				$('.alert-' + type).fadeOut(300,function(){
					$(this).remove();
				});
			},(message.length + 8000 + offset));
		});
		return $this;
	};
	
	/* Init Functions */
	var init = {
		/* 
		* Global FIX for DOM after new update
		*
		* This part of code is prepared for DOM manipulation if some huge update happen.
		* This function pickup whole DOM before initialization and return fixed DOM.
		*/
		fixDOM : function(DOM){
			
			//- Replace error with multi cellpadding added by developers mistake
			DOM = DOM.replace(/<table.*?( cellpadding="\d{1,4}").*?cellpadding=".*?".*?>/ig, function(match, need){
				return match.replace(/>$/,'').replace(/( cellpadding="\d{1,4}")/ig,'') + need + '>';
			});
			//- Replace temporarly data
			DOM = DOM.replace(/<table.*?( data-finishing=".*?").*?>/ig, function(match){
				return match.replace(/( data-finishing=".*?")/ig,'');
			});
			
			return DOM;
		},
		/* Loader template */
		loader : '<img src="https://www.tueetor.com/tueetor/images/loading-blue.gif"/>',
		/* Tooltips */
		tooltips : 	'<button type="button" class="copy" title="Copy"><span class="glyphicon glyphicon-copy"></span></button>' + 
                '<div class="overly"></div>' + 
                '<div class="save-remove">' + 
                    '<button type="button" class="save" title="Save/Done"><span class="glyphicon glyphicon-ok"></span></button>' + 
                    '<button type="button" class="edit" title="Edit Section"><span class="glyphicon glyphicon-pencil"></span></button>' + 
                    '<button type="button" class="remove" title="Delete"><span class="glyphicon glyphicon-remove-sign"></span></button>' + 
                '</div>',/* + 
                '<div class="overly"></div>',*/
		attachments : function(){
			var attachments = $.storage('attachments');	
			if(null !== attachments && attachments.length > 0)
			{
				attachments = JSON.parse(attachments);
				var attachList = $("#attach-data");
				attachList.html('').promise().done(function(){
					if(null !== attachments && attachments.length > 0)
					{
						html = [];
						j=0;
						html[j]='<li class="list-group-item text-left active"><h4><span class="glyphicon glyphicon-paperclip"></span> Attachments</h4></li>';
						for(i in attachments)
						{
							j++;
							html[j]='<li class="list-group-item text-left"><a class="badge badge-transparent remove-attachments" href="javascript:void(0);" data-id="' + i + '"><span class="glyphicon glyphicon-remove-sign"></span></a>' + attachments[i].replace(new RegExp(localStorage.session_id + '_','gi'),'') + '</li>';
						}
						attachList.append(html.join("\r\n"));
					}
				});
			}
		},
		/* Load main options */
		loadOptions : function(){			
			// layout background color
			var bodyContainerBkg = $('#dd-body-container table'),
				bodyContainerBkgColor = bodyContainerBkg.attr('bgcolor');
			if(typeof bodyContainerBkgColor !== 'undefined' && null !== bodyContainerBkgColor)
				$('#body-layout-bkg-color-body-form').val(bodyContainerBkgColor);
			else
				$('#body-layout-bkg-color-body-form').val("#ffffff");
			
			// 	body background color
			var bodyLayoutBkg = $('#dd-body-background'),
				bodyLayoutBkgColor = bodyLayoutBkg.attr('data-bkg-color');
			if(typeof bodyLayoutBkgColor !== 'undefined' && null !== bodyLayoutBkgColor)
				$('#body-layout-bkg-color-form').val(bodyLayoutBkgColor);
			else
				$('#body-layout-bkg-color-form').val("#e1e1e1");
				
			// content body
			var ddBody = $("#dd-body"),
				ddBodyImage = ddBody.attr('background'),
				ddBodyHeight = ddBody.attr('height'),
				ddBodyBkg = ddBody.attr('bgcolor');
			if(typeof ddBodyImage !== 'undefined' && null !== ddBodyImage)
				$('#content-bkg-image').val(ddBodyImage.match(/\b(ht{2}ps?:\/{2}[0-9a-z\.\/\-\_\s]+\.[a-z]{3,4})\b/gi)[0]);
			if(typeof ddBodyHeight !== 'undefined' && null !== ddBodyHeight){
				$("#content-height-val").text(ddBodyHeight+'px');
				$("#content-height").val(ddBodyHeight);
				$("#content-height").attr('data-slider-value',ddBodyHeight);
			}
			if(typeof ddBodyBkg !== 'undefined' && null !== ddBodyBkg)
				$('#content-bkg-color-form').val(ddBodyBkg);
			else
				$('#content-bkg-color-form').val("transparent");
				
			// Left Sidebar
			var ddLeft = $("#dd-sidebar-left"),
				ddLeftImage = ddLeft.attr('background'),
				ddLeftHeight = ddLeft.attr('height'),
				ddLeftBkg = ddLeft.attr('bgcolor');
			if(typeof ddLeftImage !== 'undefined' && null !== ddLeftImage)
				$('#left-bkg-image').val(ddLeftImage.match(/\b(ht{2}ps?:\/{2}[0-9a-z\.\/\-\_\s]+\.[a-z]{3,4})\b/gi)[0]);
			if(typeof ddLeftHeight !== 'undefined' && null !== ddLeftHeight){
				$("#left-height-val").text(ddLeftHeight+'px');
				$("#left-height").val(ddLeftHeight);
				$("#left-height").attr('data-slider-value',ddLeftHeight);
			}
			if(typeof ddLeftBkg !== 'undefined' && null !== ddLeftBkg)
				$('#left-bkg-color-form').val(ddLeftBkg);
			else
				$('#left-bkg-color-form').val("transparent");
				
			// Right Sidebar
			var ddRight = $("#dd-sidebar-right"),
				ddRightImage = ddRight.attr('background'),
				ddRightHeight = ddRight.attr('height'),
				ddRightBkg = ddRight.attr('bgcolor');
			if(typeof ddRightImage !== 'undefined' && null !== ddRightImage)
				$('#right-bkg-image').val(ddRightImage.match(/\b(ht{2}ps?:\/{2}[0-9a-z\.\/\-\_\s]+\.[a-z]{3,4})\b/gi)[0]);
			if(typeof ddRightHeight !== 'undefined' && null !== ddRightHeight){
				$("#right-height-val").text(ddRightHeight+'px');
				$("#right-height").val(ddRightHeight);
				$("#right-height").attr('data-slider-value',ddRightHeight);
			}
			if(typeof ddRightBkg !== 'undefined' && null !== ddRightBkg)
				$('#right-bkg-color-form').val(ddRightBkg);
			else
				$('#right-bkg-color-form').val("transparent");
			
			// header head
			var ddHead = $("#dd-head"),
				ddHeadImage = ddHead.attr('background'),
				ddHeadHeight = ddHead.attr('height'),
				ddHeadBkg = ddHead.attr('bgcolor');
			if(typeof ddHeadImage !== 'undefined' && null !== ddHeadImage)
				$('#head-bkg-image').val(ddHeadImage.match(/\b(ht{2}ps?:\/{2}[0-9a-z\.\/\-\_\s]+\.[a-z]{3,4})\b/gi)[0]);
			if(typeof ddHeadHeight !== 'undefined' && null !== ddHeadHeight){
				$("#head-height-val").text(ddHeadHeight+'px');
				$("#head-height").val(ddHeadHeight);
				$("#head-height").attr('data-slider-value',ddHeadHeight);
			}
			if(typeof ddHeadBkg !== 'undefined' && null !== ddHeadBkg)
				$('#head-bkg-color-form').val(ddHeadBkg);
			else
				$('#head-bkg-color-form').val("transparent");
				
			// content footer
			var ddFooter = $("#dd-footer"),
				ddFooterImage = ddFooter.attr('background'),
				ddFooterHeight = ddFooter.attr('height'),
				ddFooterBkg = ddFooter.attr('bgcolor');
			if(typeof ddFooterImage !== 'undefined' && null !== ddFooterImage)
				$('#footer-bkg-image').val(ddFooterImage.match(/\b(ht{2}ps?:\/{2}[0-9a-z\.\/\-\_\s]+\.[a-z]{3,4})\b/gi)[0]);
			if(typeof ddFooterHeight !== 'undefined' && null !== ddFooterHeight){
				$("#footer-height-val").text(ddFooterHeight+'px');
				$("#footer-height").val(ddFooterHeight);
				$("#footer-height").attr('data-slider-value',ddFooterHeight);
			}
			if(typeof ddFooterBkg !== 'undefined' && null !== ddFooterBkg)
				$('#footer-bkg-color-form').val(ddFooterBkg);
			else
				$('#footer-bkg-color-form').val("transparent");
				
			/* Background color */
			$('#body-layout-bkg-color').colorpicker().on('changeColor',function(e){
				var $this = $(this),
					value = e.color.toString('hex'),
					target = $('#dd-body-background');
				
				target.attr('data-bkg-color',value);
				target.css('background-color',value);
			});
			
			/* body background */
			$('#body-layout-bkg-color-body').colorpicker().on('changeColor',function(e){
				var $this = $(this),
					value = e.color.toString('hex'),
					target = $('#dd-body-container center > table');
				
				target.attr('bgcolor',value);
				target.css('background-color',value);
			});
			
			// head bkg
			$('#head-bkg-color').colorpicker().on('changeColor',function(e){
				var $this = $(this),
					value = e.color.toString('hex'),
					target = $('#dd-head');
				
				target.attr('bgcolor',value);
				target.css('background-color',value);
			});
			
			// footer bkg
			$('#footer-bkg-color').colorpicker().on('changeColor',function(e){
				var $this = $(this),
					value = e.color.toString('hex'),
					target = $('#dd-footer');
				
				target.attr('bgcolor',value);
				target.css('background-color',value);
			});
			
			// body bkg
			$('#content-bkg-color').colorpicker().on('changeColor',function(e){
				var $this = $(this),
					value = e.color.toString('hex'),
					target = $('#dd-body');

				target.attr('bgcolor',value);
				target.css('background-color',value);
			});
			
			// right sidebar
			$('#right-bkg-color').colorpicker().on('changeColor',function(e){
				var $this = $(this),
					value = e.color.toString('hex'),
					target = $('#dd-sidebar-right');
				
				target.attr('bgcolor',value);
				target.css('background-color',value);
			});
			
			// left sidebar
			$('#left-bkg-color').colorpicker().on('changeColor',function(e){
				var $this = $(this),
					value = e.color.toString('hex'),
					target = $('#dd-sidebar-left');
				
				target.attr('bgcolor',value);
				target.css('background-color',value);
			});
			
			/* Load Sliders */
			$("#head-height, #content-height, #footer-height, #left-height, #right-height").bootstrapSlider();
			
			/* Remove unusefull options */
			var bodyExists = $('#dd-body');
			if(bodyExists.length === 0) $('#dd-body-exists').remove();
			var footerExists = $('#dd-footer');
			if(bodyExists.length === 0) $('#dd-head-exists').remove();
			var headerExists = $('#dd-footer');
			if(headerExists.length === 0) $('#dd-head-exists').remove();  
			var headerExists = $('#dd-sidebar-left');
			if(headerExists.length === 0) $('#dd-sidebar-left-exists').remove();  
			var headerExists = $('#dd-sidebar-right');
			if(headerExists.length === 0) $('#dd-sidebar-right-exists').remove();  
			
			/* Attachments */
			init.attachments();
            
            try{
                textEditor.destroy();
            }catch(e){
               // console.log(e);
            }

            MediumEditorHook.clean();

            $('.popover').remove();
		},
		
		/* Switch Theme */
		chooseTheme : function(t, e, callback){
			var el = $(t),
				id = el.data('id'),
				link = window.base + '/themes/theme-' + id + '.html';

			$.get(link).always(function() {
				mb.chooseTemplate.html(init.loader);
			}).done(function(data){
				
				mb.mailTemplate.html(data).promise().done(function(){
					$('#preview').removeClass('hidden');
					$('#attachment').removeClass('hidden');
                    $('#setting').removeClass('hidden');
					window.location.hash = id;
					if($.isFunction(callback))
					{
						callback(true, data, id, link);
					}
				});
				
			}).fail(function(a, b, c){
				if($.isFunction(callback))
				{
					callback(false, a, b, c);
				}
			});
		},
		
		/* Load theme */
		loadTheme : function(callback){
			if(window.location.hash)
			{
				var id = window.location.hash,
					id = id.replace(/\#/,''),
					link = window.base + '/themes/theme-' + id + '.html';
				
				if(['no-sidebar','left-sidebar','right-sidebar','both-sidebar'].indexOf(id) > -1)
				{					
					$.get(link).always(function() {
						mb.chooseTemplate.html(init.loader).promise().done(function(){
							mb.chooseTemplate.removeClass('hidden');
							mb.tools.removeClass('hidden');

						});
					}).done(function(data){
						mb.mailTemplate.html(data).promise().done(function(){
							window.location.hash = id;
							
							var savedHTML = $.storage('save-'+id);
							
							if(null!=savedHTML && false!=savedHTML && -1!=savedHTML && typeof savedHTML !== 'undefined'){
								
								savedHTML = init.fixDOM(savedHTML);
								
								$('#mail-template').html(savedHTML).promise().done(function(){
									$('#preview').removeClass('hidden');
									$('#attachment').removeClass('hidden');
                                    $('#setting').removeClass('hidden');
									$('.editable-open').addClass('editable').removeClass('editable-open');
									if($.isFunction(callback))
									{
										callback(true, data, id, link);
									}
								});
							}
						});
					}).fail(function(a, b, c){
						if($.isFunction(callback))
						{
							callback(false, a, b, c);
						}
					});
				}
				else
					mb.chooseTemplate.removeClass('hidden');
				
			}
			else
				mb.chooseTemplate.removeClass('hidden');
		},
		
		/* Load editor */
		editorLoad : function(){
			mb.chooseTemplate.fadeOut(function(){
				$(this).hide().addClass('hidden');
				mb.optionTabs.hide().removeClass('hidden').fadeIn();
				mb.mailTemplate.hide().removeClass('hidden').fadeIn();
				mb.tools.hide().removeClass('hidden').fadeIn();
			});
		},
		
		/* Activate Drag & Drop */
		dragAndDrop : function(){
			// Activate draggable on buttons
			$( "#get-options .choose" ).draggable({
				connectToSortable: "#dd-head, #dd-body, #dd-footer, #dd-sidebar-left, #dd-sidebar-right",
				helper: "clone",
				revert: "invalid",
				tolerance: "pointer",
				grid: [ 10, 10 ],
				delay : 250,
				scroll: false,
				revertDuration: 0,
				start:function( event, ui ){
					$(document.body).css( 'cursor', '-webkit-grabbing' );
                    $(".editable-content").removeClass('editable-content');
                    $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
                     $('.editable-open, .editable').parents('.ui-draggable').draggable({ disabled: false });
				},
				stop:function( event, ui ){
					$(document.body).css( 'cursor', 'auto' );
                    $(".editable-content").removeClass('editable-content');
                    $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
                     $('.editable-open, .editable').parents('.ui-draggable').draggable({ disabled: false });
				},
				drag: function( event, ui ) {
                    $(".editable-content").removeClass('editable-content');
                    $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
                    $('.editable-open, .editable').parents('.ui-draggable').draggable({ disabled: false });
                },
				create: function( event, ui ) {
                    $(".editable-content").removeClass('editable-content');
                    $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
                     $('.editable-open, .editable').parents('.ui-draggable').draggable({ disabled: false });
                },
				drop: function(event, ui) {	
					ui.draggable.remove();
				}
			});
			
			// sort all elements
			$( "#dd-head, #dd-body, #dd-footer, #dd-sidebar-left, #dd-sidebar-right" ).sortable({
				revert: true,
				delay : 250,
				grid: [ 10, 10 ],
				scroll: false,
				revertDuration: 0,
				revert: 0,
				connectWith: '#dd-head, #dd-body, #dd-footer, #dd-sidebar-left, #dd-sidebar-right',
				tolerance: "pointer",
				start: function(event, ui){						
					
					var $this = $(this);
					
					$(document.body).css( 'cursor', '-webkit-grabbing' );
					
					$this.addClass('active');
					
					 $('body').one("mouseleave", function(){
						  $('body').mouseup();
					 });
				},
				beforeStop: function( event, ui ) {
					
				},
                drag: function( event, ui ) {
                    $(".editable-content").removeClass('editable-content');
                    $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
                     $('.editable-open, .editable').parents('.ui-draggable').draggable({ disabled: false });
                },
				create: function( event, ui ) {
                    $(".editable-content").removeClass('editable-content');
                    $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
                     $('.editable-open, .editable').parents('.ui-draggable').draggable({ disabled: false });
                },
				stop: function(event, ui)
				{
					$(document.body).css( 'cursor', 'auto' );
					
					var $this = $(this),
						moved = $(".choose.ui-draggable",this),
						prev = moved.prev('.ui-draggable') || false;
						next = moved.next('.ui-draggable') || false;
						idMoved = moved.attr('data-id'),
						idDropped = $this.attr('id');
						
					$( "#dd-head, #dd-body, #dd-footer, #dd-sidebar-left, #dd-sidebar-right" ).removeClass('active');

					if(typeof idMoved !== 'undefined' && idMoved !== 'undefined')
					{						
						$.get(window.base + '/themes/form-' + idMoved + '.html').done(function(html){
							
							moved.html(html).promise().done(function(){
								
                                var movedData = moved.html(),
									type = moved.attr('data-id'),
									finishing,
									template = '<table align="center" cellpadding="10" border="0" class="ui-draggable ui-draggable-handle editable" style="width:100%; margin:0 auto;" width="100%" data-edit="'+idMoved+'" data-finishing="'+idMoved+'">'+
										'<tbody>'+
											'<tr>'+
												'<td align="left">'+
													init.tooltips + 
													movedData + 
												'</td>'+
											'</tr>'+
										'</tbody>'+
									'</table>';
									
								moved.remove();
								
								if(typeof next !== 'undefined' && false !== next && null !== next && '' !== next && next.length > 0)
								{
									finishing = next.before(template);
								}
								else if(typeof prev !== 'undefined' && false !== prev && null !== prev && '' !== prev && prev.length > 0)
								{
									finishing = prev.after(template);
								}
								else
								{
									finishing = $this.append(template);
								}
								
								finishing.promise().done(function(){									
									$(".ui-droppable-hover").removeClass('ui-droppable-hover');
									
									// special setups
									if(type == 'link')
									{
										$this.find('table[data-finishing^="'+idMoved+'"] tr > td').attr('align','center');
									}
									$this.find('table[data-finishing^="'+idMoved+'"]').attr('data-finishing',null);
								});
							});
						}).fail(function(a,b,c) {
							console.log(a,b,c);
						});
					}
				}
			});
		},
	}
	
	/*****************************************************************
	 * Here starting main button functionality
	**/
	
	/* Change theme on click */
	mb.chooseTemplate.find('.choose').on('click',function(e){
		e.preventDefault();
		init.chooseTheme(this, e, function(load){
			if(load===true)
			{
				init.editorLoad();
				init.dragAndDrop();
				init.loadOptions();
			}
		});
	});

	var openEditor = true;



	$(document).on('click touchstart','#mail-template button.copy',function(e){
		e.preventDefault();
		var $this = $(this),
			copy = $this.parents('table'),
			parent = $(copy[0]).parent().attr('id');

		$(copy[0]).clone().appendTo('#' + parent);
	});

	/* Remove content section */
	$(document).on('click touchstart','#mail-template button.remove',function(e){
		e.preventDefault();
		openEditor = false;
		var $this = $(this),
			remove = $this.parents('table')[0];
		bootbox.confirm({
			message : '<h3>Are you sure you want delete this element?</h3>',
			title : 'Please confirm!',
			buttons: {
				confirm: {
					label: 'DELETE',
					className: 'btn-danger'
				},
				cancel: {
					label: 'No',
					className: 'btn-default'
				}
			},
			callback : function(result){
			if(result)
			{
                $('.tooltip-editor').remove();
                
                totalCleaner();
                
                $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
				remove.remove();
				$("#panel-edit").fadeOut(function(){
					$(this).remove();
				});
				setTimeout(function(){
					openEditor = true;
				},1000);
			}
			else
			{
				setTimeout(function(){
					openEditor = true;
				},1000);
			}
		}});
	});
    
    
    $(document).on('click touchstart','.editable-open .save-remove > .save',function(e){
		e.preventDefault();
        var $this = $(this).parents('.editable-open'),
            id = $this.attr('data-set');
        
        totalCleaner();
        
        $('.tooltip-editor').remove();
        
		$('[data-remove^="' + id + '"]').fadeOut(300,function(){
			$(this).remove();
			$('.editable-open').addClass('editable').removeClass('editable-open');
		});
        
        try{
            textEditor.destroy();
        }catch(e){
           // console.log(e);
        }
        
        $this.removeClass('editable-open').addClass('editable');
        
        $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
        
        MediumEditorHook.clean();

	});
    
    // Remove editor on DONE
	$(document).on('click touchstart','#remove-editor',function(e){
		e.preventDefault();
        
        totalCleaner();
        
        $('.tooltip-editor').remove();
        
		var id = $(this).attr('data-id');
		$('[data-remove^="' + id + '"]').fadeOut(300,function(){
			$(this).remove();
			$('.editable-open').addClass('editable').removeClass('editable-open');
		});
        
        try{
            textEditor.destroy();
        }catch(e){
           // console.log(e);
        }
        
        $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
        
        MediumEditorHook.clean();
	});
    


	// Edit Content
	$(document).on('click touchstart','.editable, .editable-open',function(e){
        
        if ($(e.target).is('.glyphicon-pencil') || $(e.target).is('.edit') || $(e.target).is('.editable') || $(e.target).is('.editable-open') || $(e.target).is('.overly'))
		{
			e.preventDefault();
            
            // .editable-content | .ready-for-edit
            $(".editable-content").removeClass('editable-content');
            $('.editable-open, .editable').parents('.ui-sortable').sortable({ disabled: false });
            
            totalCleaner();
            
            try{
                textEditor.destroy();
            }catch(e){
               // console.log(e);
            }
            
			$('.editable-open').addClass('editable').removeClass('editable-open');
            

			var $this = $(this),
				type = $this.attr('data-edit'),
				id = type + '-' + Math.floor(Date.now() / 1000),
				data = $this.find('tr > td').html(),
				html = '', tooltip = '',
                $editor = {
                    buttons : [],
                    cleanTags : []
                };
            
            $('*[data-remove]').each(function(){
                $(this).remove();
            });
            
			$this.attr('data-set', id);
			$this.removeClass('editable').addClass('editable-open');
            $this.find('.ready-for-edit').addClass('editable-content');

            $('.editable-open').parents('.ui-sortable').sortable({ disabled: true });
            
			if(['content','image','link','quote','title','divider','video'].indexOf(type) > -1 && openEditor)
			{
				data = data.replace(/(<button.*?>.*?<\/button>)/g,'');
                
				switch(type)
                {
                    case 'content':
                       $editor.buttons = [{
                            name: 'bold',
                            contentDefault: '<i class="fa fa-bold"></i>'
                        }, { 
                            name: 'italic',
                            contentDefault: '<i class="fa fa-italic"></i>'
                        }, {
                            name: 'underline',
                            contentDefault: '<i class="fa fa-underline"></i>', 
                        }, {
                            name: 'colorPicker',
                        }, {
                            name: 'anchor',
                            contentDefault: '<i class="fa fa-link"></i>', 
                        }, {
                            name: 'strikethrough',
                            contentDefault: '<i class="fa fa-strikethrough"></i>'
                        }, {
                            name: 'pre',
                            contentDefault: '<i class="fa fa-code"></i>'
                        }, {
                            name: 'orderedlist',
                            contentDefault: '<i class="fa fa-list-ol"></i>'
                        }, {
                            name: 'unorderedlist',
                            contentDefault: '<i class="fa fa-list-ul"></i>'
                        }, {
                            name: 'justifyLeft',
                            contentDefault: '<i class="fa fa-align-left"></i>'
                        }, {
                            name: 'justifyCenter',
                            contentDefault: '<i class="fa fa-align-center"></i>'
                        }, {
                            name: 'justifyRight',
                            contentDefault: '<i class="fa fa-align-right"></i>'
                        }, {
                            name: 'justifyFull',
                            contentDefault: '<i class="fa fa-align-justify"></i>'
                        }, {
                            name: 'h1',
                            contentDefault: '<i class="fa fa-header">1</i>'
                        }, {
                            name: 'h2',
                            contentDefault: '<i class="fa fa-header">2</i>'
                        }, {
                            name: 'h3',
                            contentDefault: '<i class="fa fa-header">3</i>'
                        }, {
                            name: 'h4',
                            contentDefault: '<i class="fa fa-header">4</i>'
                        }, {
                            name: 'h5',
                            contentDefault: '<i class="fa fa-header">5</i>'
                        }, {
                            name: 'h6',
                            contentDefault: '<i class="fa fa-header">6</i>'
                        }, {
                            name: 'removeFormat',
                            contentDefault: '<i class="fa fa-eraser"></i>'
                        },
                    ];
                        
                        $editor.cleanTags = ['meta', 'img', 'div', 'form', 'input', 'select', 'textarea', 'blockquote', 'link', 'script'];
                    break;
                    
                    
                    case 'title':
                        $editor.buttons = [{
                            name: 'bold',
                            contentDefault: '<i class="fa fa-bold"></i>'
                        }, { 
                            name: 'italic',
                            contentDefault: '<i class="fa fa-italic"></i>'
                        }, {
                            name: 'underline',
                            contentDefault: '<i class="fa fa-underline"></i>', 
                        }, {
                            name: 'colorPicker',
                        }, {
                            name: 'justifyLeft',
                            contentDefault: '<i class="fa fa-align-left"></i>'
                        }, {
                            name: 'justifyCenter',
                            contentDefault: '<i class="fa fa-align-center"></i>'
                        }, {
                            name: 'justifyRight',
                            contentDefault: '<i class="fa fa-align-right"></i>'
                        }, {
                            name: 'justifyFull',
                            contentDefault: '<i class="fa fa-align-justify"></i>'
                        }, {
                            name: 'h1',
                            contentDefault: '<i class="fa fa-header">1</i>'
                        }, {
                            name: 'h2',
                            contentDefault: '<i class="fa fa-header">2</i>'
                        }, {
                            name: 'h3',
                            contentDefault: '<i class="fa fa-header">3</i>'
                        }, {
                            name: 'h4',
                            contentDefault: '<i class="fa fa-header">4</i>'
                        }, {
                            name: 'h5',
                            contentDefault: '<i class="fa fa-header">5</i>'
                        }, {
                            name: 'h6',
                            contentDefault: '<i class="fa fa-header">6</i>'
                        }
                    ];
                        $editor.cleanTags = ['meta', 'img', 'div', 'form', 'input', 'select', 'textarea', 'blockquote', 'link', 'script', 'p', 'code', 'ul', 'li', 'ol', 'dd', 'dl', 'pre', 'sub', 'sup'];
                    break;
                        
                    case 'image':

                            $this.find('img').attr('id','add-'+id);

                            src = data.match(/<img.*?src="(.*?)".*?>/i);
                            if(null !== src)
                                src = src[0].replace(/<img.*?src="(.*?)".*?>/i,'$1').replace(/(\?h\=[0-9]+)/i,'');

                            if(!(/(https?|ftps?)/g.test(src)))
                                src = '';

                            link = $this.html();

                            if(/<a.*?href="(.*?)".*?\/a>/g.test(link)){
                                url = link.match(/<a.*?href="(.*?)".*?\/a>/i);
                                if(null !== url)
                                    url = url[0].replace(/<a.*?href="(.*?)".*?\/a>/i,'$1');
                                else
                                    url = '';
                            }
                            else
                                url = '';
                        
                          
						tooltip+="<div class='input-group'>\
						<span class='input-group-addon'><span class='glyphicon glyphicon-link'></span></span>\
						<input type='file' value='" + url.trim() + "' class='form-control add-image' data-type='file' data-id='" + id + "' placeholder='Upload Image Link' >\
					</div>";
                        
                        tooltip+="<div class='br'></div>";
                      
                    break;
                        
                        
                    case 'link':

                            $this.find('a').attr('id','add-'+id);

                            data = $this.find('a').parent().html();

                            if(/<a.*?href="(.*?)".*?\/a>/g.test(data))
                                href = data.replace(/<a.*?href="(.*?)".*?\/a>/g,function(a,b){
                                    return b;
                                });
                            else
                                href = '';

                            if(/<a.*?alt="(.*?)".*?\/a>/g.test(data))
                                alt = data.replace(/<a.*?alt="(.*?)".*?\/a>/g,function(a,b){
                                    return b;
                                });
                            else
                                alt = '';

                            content = data.replace(/<a.*?>(.*?)<\/a>/g,function(a,b){
                                return b;
                            });

                            if(/<a.*?data-color="(.*?)".*?\/a>/g.test(data))
                                color = data.replace(/<a.*?data-color="(.*?)".*?\/a>/g,function(a,b){
                                    return b;
                                });
                            else
                                color = '#337ab7';

                            if(/<a.*?data-align="(.*?)".*?\/a>/g.test(data))
                            {
                                align = data.replace(/<a.*?data-align="(.*?)".*?\/a>/g,function(a,b){
                                    return b;
                                });
                                align = align.replace(/[^0-9]/ig,'');
                            }
                            else
                                align = '1';

                            if(/<a.*?data-size="(.*?)".*?\/a>/g.test(data))
                            {
                                size = data.replace(/<a.*?data-size="(.*?)".*?\/a>/g,function(a,b){
                                    return b;
                                });
                                size = size.replace(/[^0-9]/ig,'');
                            }
                            else
                                size = '3';

                            if(/<a.*?data-background="(.*?)".*?\/a>/g.test(data))
                                background = data.replace(/<a.*?data-background="(.*?)".*?\/a>/g,function(a,b){
                                    return b;
                                });
                            else
                                background = 'transparent';
                        
                        tooltip+="<div class='input-group'>\
                            <span class='input-group-addon'><span class='glyphicon glyphicon-link'></span></span>\
                            <input type='text' value='" + href.trim() + "' class='form-control add-link' data-type='url' data-id='" + id + "' placeholder='http://' >\
                        </div>";
                        
                        tooltip+="<div class='br'></div>";
                        
                        tooltip+="<div class='input-group'>\
                            <span class='input-group-addon'><span class='glyphicon glyphicon-text-size'></span></span>\
                            <input type='text' value='" + content.trim() + "' class='form-control add-link' data-type='text' data-id='" + id + "' placeholder='Link Title' >\
                        </div>";
                        
                        tooltip+="<div class='br'></div>";
                        
                        tooltip+="<div class='form-horizontal'>\
                            <div class='form-group'>\
                                <label for='color' class='col-sm-6 control-label'>Color:</label>\
                                <div class='col-sm-6 text-right'>\
                                    <div class='input-group colorpicker-component'>\
                                        <input type='text' value='" + color.trim() + "' class='form-control add-link' data-type='color' data-id='" + id + "' >\
                                        <span class='input-group-addon'><i></i></span>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>";
                        
                        tooltip+="<div class='br'></div>";
                        
                        tooltip+="<div class='form-horizontal'>\
                            <div class='form-group'>\
                                <label for='link-background' class='col-sm-6 control-label'>Background:</label>\
                                <div class='col-sm-6 text-right'>\
                                    <div class='input-group colorpicker-component'>\
                                        <input type='text' value='" + background.trim() + "' class='form-control add-link' data-type='background' data-id='" + id + "' >\
                                        <span class='input-group-addon'><i></i></span>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>";
                        
                        tooltip+="<div class='br'></div>";
                        
                        tooltip+="<div class='form-horizontal'>\
                            <div class='form-group'>\
                                <label for='link-position' class='col-sm-6 control-label'>Position:</label>\
                                <div class='col-sm-6 text-right'>";
                                tooltip+="<div class='input-group colorpicker-component'>";
                                    tooltip+="<input type='text' data-provide='slider' id='link-position' data-type='position'";
                                     tooltip+=" data-slider-ticks='[1, 2, 3]'";
                                     tooltip+=" data-slider-ticks-labels='[\\\"left\\\", \\\"center\\\", \\\"right\\\"]'";
                                     tooltip+=" data-slider-min='1'";
                                     tooltip+=" data-slider-max='3'";
                                     tooltip+=" data-slider-step='1'";
                                     tooltip+=" data-slider-value='" + align + "'";
                                     tooltip+=" data-slider-tooltip='hide'>";
                                tooltip+='</div>';
                            tooltip+="</div>\
                                </div>\
                            </div>\
                        </div>";
                        
                        tooltip+="<div class='br'></div>";
                        
                        tooltip+="<div class='form-horizontal'>\
                            <div class='form-group'>\
                                <label for='link-size' class='col-sm-6 control-label'>Size:</label>\
                                <div class='col-sm-6 text-right'>";
                                tooltip+="<div class='input-group colorpicker-component'>";
                                    tooltip+="<input type='text' data-provide='slider' id='link-size' data-type='position'";
                                     tooltip+=" data-slider-ticks='[1, 2, 3, 4, 5, 6, 7]'";
                                     tooltip+=" data-slider-ticks-labels='[\\\"8pt\\\", \\\"10pt\\\", \\\"12pt\\\", \\\"14pt\\\", \\\"18pt\\\", \\\"24pt\\\", \\\"36pt\\\"]'";
                                     tooltip+=" data-slider-min='1'";
                                     tooltip+=" data-slider-max='3'";
                                     tooltip+=" data-slider-step='1'";
                                     tooltip+=" data-slider-value='" + size + "'";
                                     tooltip+=" data-slider-tooltip='hide'>";
                                tooltip+='</div>';
                            tooltip+="</div>\
                                </div>\
                            </div>\
                        </div>";
                        
                        tooltip+="<div class='br'></div>";
                        
                    break;                        
                        
                        
                    case 'divider':
                        var bColor = data.match(/data-border-color=\"(.*?)\"/g);
                        if(null !== bColor){
                            bColor = bColor[0].replace(/data-border-color=\"(.*?)\"/g,'$1');
                        }
                        else
                            bColor = '#cccccc';

                        tooltip+="<div class='input-group colorpicker-component'>\
                            <input type='text' value='" + bColor.trim() + "' class='form-control add-divider' data-type='border-color' data-id='" + id + "' >\
                            <span class='input-group-addon'><i></i></span>\
                        </div>";
                        
                    break;
                        
                        
                    case 'video':
                            $this.find('img').attr('id','add-'+id);
						
                            src = $this.find('tr > td[data-video]').attr('data-video');
                            if(null === src)
                                src = '';

                            if(!(/(https?|ftps?)/g.test(src)))
                                src = '';

                            link = $this.html();

                            if(/<a.*?href="(.*?)".*?\/a>/g.test(link)){
                                url = link.match(/<a.*?href="(.*?)".*?\/a>/i);
                                if(null !== url)
                                    url = url[0].replace(/<a.*?href="(.*?)".*?\/a>/i,'$1');
                                else
                                    url = '';
                            }
                            else
                                url = '';
                        
                        
                        tooltip += "<div class='input-group'>\
                            <span class='input-group-addon'>\
                                <span class='glyphicon glyphicon-link'></span>\
                            </span>\
                            <input type='text' class='form-control add-video' placeholder='Insert Video URL' value='" + $.trim(src) + "' data-type='src' data-id='" + id + "'>\
                        </div>";
                    break;
                }
                
                /* PROCESSED */
                switch(type)
                {
                    case 'content':
                    case 'title':
                        var currentTextSelection;

                        /**
                        * Gets the color of the current text selection
                        */
                        function getCurrentTextColor(){
                            return $(textEditor.getSelectedParentElement()).css('color');
                        }

                        /**
                         * Custom `color picker` extension
                         */
                        var ColorPickerExtension = MediumEditor.extensions.button.extend({
                            name: "colorPicker",
                            action: "applyForeColor",
                            aria: "color picker",
                            contentDefault: "<span class='fa fa-paint-brush' title='Text Color'></span>",

                            init: function() {
                                this.button = this.document.createElement('button');
                                this.button.classList.add('medium-editor-action');
                                this.button.innerHTML = '<span class="fa fa-paint-brush" title="Text Color"></span>';

                                //init spectrum color picker for this button
                                initPicker(this.button);

                                //use our own handleClick instead of the default one
                                this.on(this.button, 'click', this.handleClick.bind(this));
                            },
                             handleClick: function (event) {
                                 //keeping record of the current text selection
                                 currentTextSelection = textEditor.exportSelection();

                                 //sets the color of the current selection on the color picker
                                 $(this.button).spectrum("set", getCurrentTextColor());

                                 //from here on, it was taken form the default handleClick
                                 event.preventDefault();
                                 event.stopPropagation();

                                 var action = this.getAction();

                                 if (action) {
                                     this.execAction(action);
                                 }
                             }
                        });

                        var pickerExtension = new ColorPickerExtension();

                        function setColor(color) {
                            var finalColor = color ? color.toRgbString() : 'rgba(0,0,0,0)';

                            pickerExtension.base.importSelection(currentTextSelection);
                            pickerExtension.document.execCommand("styleWithCSS", false, true);
                            pickerExtension.document.execCommand("foreColor", false, finalColor);
                        }

                        function initPicker(element) {
                            $(element).spectrum({
                                allowEmpty: true,
                                color: "#333333",
                                showInput: true,
                                showAlpha: false,
                                showPalette: true,
                                showInitial: true,
                                hideAfterPaletteSelect: true,
                                preferredFormat: "hex6",
                                change: function(color) {
                                    setColor(color);
                                },
                                hide: function(color) {
                                    setColor(color);
                                },
                                palette: [
                                    ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                                    ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                                    ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                                    ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                                    ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                                    ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                                    ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                                    ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                                ]
                            });
                        }
                        textEditor = new MediumEditor('.editable-content',{
                            keyboardCommands: true,
                            autoLink: true,
                            imageDragging: false,
                            toolbar: {
                                buttons: $editor.buttons,
                                diffLeft: 0,
                                diffTop: -5,
                                static: true,
                                sticky: true,
                                standardizeSelectionStart: true,
                                updateOnEmptySelection: true,
                                relativeContainer : document.getElementById(id)
                            },

                            extensions: {
                                'imageDragging': {},
                                'colorPicker': pickerExtension
                            },

                            paste: {
                                /* This example includes the default options for paste,
                                   if nothing is passed this is what it used */
                                forcePlainText: true,
                                cleanPastedHTML: true,
                                cleanAttrs: ['class', 'style', 'dir','alt','data','rel'],
                                unwrapTags: ['sub', 'sup'],
                                cleanTags: $editor.cleanTags,
                            },

                            anchor: {
                                /* These are the default options for anchor form,
                                   if nothing is passed this is what it used */
                                customClassOption: null,
                                customClassOptionText: 'Button',
                                linkValidation: true,
                                placeholderText: 'Paste or type a link',
                                targetCheckbox: true,
                                targetCheckboxText: 'Open in new window'
                            },

                            placeholder: {
                                /* This example includes the default options for placeholder,
                                if nothing is passed this is what it used */
                                text: 'Type your text...',
                                hideOnClick: true
                            },
                        });
                        
                        $("[data-set^='" + id + "'] .editable-content").focus().keyup();
                    break;
                }
                /*
                function fix_attributes(str){
                    str = str.replace(/\"/,'\\"'));
                    return str;
                }
                */
                if(!$.empty(tooltip))
                {                    
                    switch(type)
                    {
                        case 'divider'  :
                        case 'video'    :
                        case 'link'     :
                        case 'image'    :
                            var popoverElement,
                                is_head = ($('.editable-open').parents('#dd-head') ? true : false),
                                placement = 'auto',
                                container = '.editable-open';
                            
                            if(type == 'video'){
                                popoverElement = $('.editable-open').find('tbody > tr > td:first-child');
                            }else if(type == 'divider'){
                                popoverElement = $($('.editable-open').find('tbody > tr > td > table > tbody > tr').get(1));
                            }else if(type == 'link' || type == 'image'){
                                popoverElement = $('.editable-open > tbody > tr > td:first-child');
                            //    placement = 'bottom';
                                
                                if($('.editable-open').parents('#dd-footer'))
                                    container = '#dd-footer';
                                else if($('.editable-open').parents('#dd-head'))
                                    container = '#dd-head';
                                else if($('.editable-open').parents('#dd-body'))
                                    container = '#dd-body';
                            }
                            
                            popoverElement
                                .attr('data-container','.editable-open')
                                .attr('data-toggle','popover')
                                .attr('data-content',tooltip);
/*
		
		1. Check if is inside dd-head
		2. Check is editable-open only one or first child
		4. If 1. or 2. is TRUE, move popover at the bottom
		5. For all others popover must be above content
		
*/
                            popoverElement.popover({
                                container   : container,
                                placement   : placement,
                                html        : true,
                                delay       : 0,
                                animation   : false,
                                trigger     : 'manual',
                                template    : '<div class="popover' + (['image','link'].indexOf(type) !== -1 ? ' popover-lg':'') + '" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
                            }).popover('show');
                            
                            if(type == 'divider')
                                $('.colorpicker-component, .colorpicker-component input').colorpicker();
                            else if(type == 'link')
                            {
                                $('.colorpicker-component, .colorpicker-component input').colorpicker();

                                $("#link-position").bootstrapSlider().on("slide slideStop", function(slideEvt) {
                                    var val = slideEvt.value,
                                    //	set = [0, "0 auto 0 0", "0 auto","0 0 0 auto" ],
                                        align = [0, "left", "center","right" ],
                                        input = $('#add-' + id ),document
                                        alignTable = input.parents('table')[1];

                                    $(alignTable).find('> tbody > tr > td').attr('align',align[val]);
                                    $(alignTable).find('table').css('text-align',align[val]);
                                    input.attr('data-align',val);
                                });

                                $("#link-size").bootstrapSlider().on("slide slideStop", function(slideEvt) {
                                    var val = slideEvt.value,
                                        set = [0, "8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"]
                                        height = [0, "10pt", "12pt", "14pt", "16pt", "20pt", "26pt", "38pt"],
                                        input = $('#add-' + id );

                                    input.css({
                                        'font-size':set[val],
                                        'line-height':height[val]
                                    }).attr('data-size',val);								
                                });
                            }
                            else if(type == 'image')
                            {
                                var image = $('#add-'+id),
                                     image_original = image.attr('data-original'),
                                     input = $('[data-remove^="' + id + '"]').find('[data-type^="src"]').val(),
                                     buttonEdit = $("#CreateDynamicImage"),
                                     buttonDelete = $("#DeleteDynamicImage");

                                if(buttonEdit) buttonEdit.attr('data-id','add-'+id);
                                if(buttonDelete) buttonDelete.attr('data-id','add-'+id);
                                
                                if(input && input.length>0)
                                {
                                    if(buttonEdit)
                                        buttonEdit.removeClass('hidden');
                                }
                                else
                                {
                                    if(buttonEdit)
                                        buttonEdit.addClass('hidden');
                                }

                                if(image_original && image_original.length>0)
                                {
                                    if(buttonEdit)
                                        buttonEdit.html('<span class="glyphicon glyphicon-pencil"></span> Edit Generic Image').removeClass('hidden');
                                    if(buttonDelete)
                                        buttonDelete.removeClass('hidden');
                                }
                                else
                                {
                                    if(buttonDelete)
                                        buttonDelete.addClass('hidden');
                                }
                            }
                        break;
                    }
                }                
			}
		}
	});
    
    $(document).on('mouseover','.editable-content',function(){
        $(this).focus().keyup();
    });
    $(document).on('mouseleave','.editable-content',function(e){
        if($(e.target).is('.dd-body-container') || $(e.target).is('.ready-for-edit'))
        {
            $(this).blur();
            textEditor.subscribe('blur', function (event, editable) {
                console.debug('blurred!', event, editable)
            })
        }
    });
 
	// Content Background
	$(document).on('input change paste keyup','.edit-content',$.debounce(250,function(e){
		var $this = $(this),
			id = $this.attr('data-id'),
			type = $(this).attr('data-type'),
			value = $(this).val().trim();
			
		if(value == '' && type != 'alt')
			value=null;

		if(type=='background'){
			$('[data-set^="' + id + '"]' ).attr('data-background',value).css({'background-color':value}).attr('bgcolor',value);
		}
	}));
	
	// Heading Background
	$(document).on('input change paste keyup','.edit-heading',$.debounce(250,function(e){
		var $this = $(this),
			id = $this.attr('data-id'),
			type = $(this).attr('data-type'),
			value = $(this).val().trim();
			
		if(value == '' && type != 'alt')
			value=null;

		if(type=='background'){
			$('[data-set^="' + id + '"]' ).attr('data-background',value).css({'background-color':value}).attr('bgcolor',value);
		}
	}));
	
	// Setup color on devider
	$(document).on('input change paste keyup','.add-divider',$.debounce(250,function(e){
		var $this = $(this),
			id = $this.attr('data-id'),
			type = $(this).attr('data-type'),
			value = $(this).val().trim();

		if(type=='border-color'){
			$('.editable-open table tr:nth-child(2) td' ).css('border-top','1px solid '+value);
			$('.editable-open table' ).attr('data-border-color',value);
		}
	}));
	
	// Update Video
	$(document).on('change paste keyup','.add-video',$.debounce(350,function(e){
		
		var $this = $(this),
			id = $this.attr('data-id'),
			type = $(this).attr('data-type'),
			value = $(this).val().trim(),
			main = $('.editable-open').find('tr > td');
		
		if(value == '' && type != 'alt')
			value=null;

		if(type == 'src'){
			if('' !== value && null !== value && $.isVideo(value) && (e.type === 'keyup' ? (e.keyCode != 8 ? true : false) : true))
			{
				if($.urlExists(value))
				{
					var i = 0, frame = 5, video = document.createElement("video"), imgWidth = main.find("img").width();
					
					video.addEventListener('loadeddata', function() {
						video.currentTime = i;
					}, false);
					
					video.addEventListener('seeked', function() {
						i++
						// Get image from certain frame
						if (i === frame) {
							// now video has seeked and current frames will show
							// at the time as we expect
							var canvas = generateThumbnail(i);
	
						}
						// if we are not passed end, seek to next interval
						else
						{
							// this will trigger another seeked event
							video.currentTime = i;
						}
					}, false);
					
					video.preload = "auto";
					video.src = value;
					
					function isCanvasBlank(canvas) {
						var blank = document.createElement('canvas');
						blank.width = canvas.width;
						blank.height = canvas.height;
						
						return canvas.toDataURL() == blank.toDataURL();
					}
					
					function generateThumbnail() {
						main.find("canvas").remove();
						var c = document.createElement("canvas"),
							ctx = c.getContext("2d"),
							play = new Image();
						c.id = 'canvas';
						c.width = 600;
						c.height = (c.width / ( 16 / 9 ));						
						
						//ctx.drawImage(video, 0, 0, c.width, c.height);
						
						play.onload = function(){
							ctx.drawImage(video, 0, 0, c.width, c.height);
							ctx.drawImage(this,
								c.width / 2 - this.width / 2,
								c.height / 2 - this.height / 2
							);
							
							
							try {
								setTimeout(function(){
									main.get(0).appendChild(c);
									
									main.find("img").remove();
									
									var dataUrl=c.toDataURL("image/png");
									generateImage(dataUrl, imgWidth, value);
									main.attr('data-video', value);
								},30);
							}
							catch(err) {
								console.log("WARNING: Image is not crated.");
							}
						};
						play.src = window.base + '/assets/img/play_button.png';
						
						
						
						return c;
					}
					
					function generateImage(url, width, link){
						var img = new Image();
						img.crossOrigin = "Anonymous";
						img.width = width;
						img.height = (img.width / ( 16 / 9 ));
						img.src = url;
						img.align = 'middle';
						img.class = 'img-responsive';
						img.style.width = '100%';
						img.style.maxWidth = '600px';
						
						var a = document.createElement("a");
						a.href=link;
						a.target = '_blank';
						a.rel = 'nofollow';
						a.style.width = '100%';
						a.appendChild(img);
						
						main.html(init.tooltips);
						main.get(0).appendChild(a);
					}
				}
				else
				{
					$.get(window.base + '/themes/form-video.html').done(function(html){
						main.html(init.tooltips + html);
						stop = false;
						main.attr('data-video', '');
					});
				}
			}
			else
			{
				$.get(window.base + '/themes/form-video.html').done(function(html){
					main.html(init.tooltips + html);
					stop = false;
					main.attr('data-video', '');
				});
			}
		}
	}));
	
	// Update image
	$(document).on('input change paste keyup','.add-image',$.debounce(350,function(e){
		var $this = $(this),
			id = $this.attr('data-id'),
			type = $(this).attr('data-type'),
			value = $(this).val().trim();
		
		if(value == '' && type != 'alt')
			value=null;

		if(type == 'src' && $.isImg(value)){
            if($("#loadNewImg")) $("#loadNewImg").remove();
            $(this).parent().after('<span id="loadNewImg">Loading...</span>');
            
			$('#add-' + id ).attr('src',value+'?h=' + $.rand(10000,99999) + '' + $.rand(10000,99999));
			
			if($('#add-' + id ).attr('alt') == '')
			{
				$('#add-' + id ).attr('alt',value);
			}
			
			/* Setup image width and height */
			var img = new Image();
			img.onload = function(){
				var w = this.width, h = this.height;
				$('#add-' + id ).css({
					width : 100 + '%',
					height : 'auto',
					maxWidth : w,
					maxHeight : h,
				});
                $("#loadNewImg").remove();
                if($("#CreateDynamicImage"))
                    $("#CreateDynamicImage").removeClass('hidden');
			};
			img.src = value;
		
		}else if(type == 'alt'){
			$('#add-' + id ).attr('alt',value);
		}else if(type == 'title'){
			$('#add-' + id ).attr('title',value);
		}else if (type == 'file') {
				var datafile = new FormData();
				datafile.append("file", $(this)[0].files[0]);
				$.post({
					url: 'UPLOAD_FILE_ENDPOINT',
					enctype: 'multipart/form-data',
					data: datafile,
					method: 'POST',
					processData: false,
					contentType: false,
					cache: false,
					success: function (data) {
						data = JSON.parse(data); 
						if (data.file_name !== '' && data.status ==='success') {
							var image_path = site_url+'/ImagesFolder/' + data.file_name;
							$('#add-' + id).attr('src', image_path); 
								if($('#add-' + id ).attr('alt') == '')
								{
										$('#add-' + id ).attr('alt',image_path);
								}
						}else{
							alert(data.errors[0]);
						}
					}
				});
			}
		}));
	
	// Update link
	$(document).on('input change paste keyup','.add-link',$.debounce(250,function(e){
		var $this = $(this),
			id = $this.attr('data-id'),
			type = $(this).attr('data-type'),
			value = $(this).val();
			
		if(value == '')
			value=null;
			
		if(type == 'url')
			$('#add-' + id ).attr('href',value.trim());
		else if(type == 'text'){
			value = value.replace(/(\s)/gi,'&nbsp;');
			$('#add-' + id ).html(value);
			$('#add-' + id ).attr('title',value);
		}
		else if(type == 'color'){
			$('#add-' + id ).attr('data-color',value.trim());
			$('#add-' + id ).css('color',value);
		}
		else if(type == 'background'){
			$('#add-' + id ).attr('data-background',value.trim());
			var bkg = $('#add-' + id ).parents('table')[0];
			
			$(bkg).css({'background-color':value});
			$(bkg).attr('bgcolor',value);
		}
	}));
	
	/* Stop opening hyperlinks */
	$(document).on('click', '#mail-template a', function(e){
		e.preventDefault();
		return false;
	});
	
	/* Preview */
	$("#preview").on('click touchstart',function(e){
		e.preventDefault();
		
        MediumEditorHook.clean();
        totalCleaner();
        
		var $button = $(this),
			data = $("#mail-template").html();
			data = data.replace(/(<button.*?>.*?<\/button>)/g,'');
		
		$button.tooltip('hide');
		
		$button.prop('disabled',true);
		
		$("#modal").createModal({
			header		: "Mail Preview",
			content		: data,
			footer		: "",
			keyboard 	: true,
			static 		: true,
			close		: true,
			large		: true,
			class		: 'modal-preview'
		},
		function($this){
			$("#modal #dd-body-background").css({
				height:'',
			});
			
			setTimeout(function(){
				var RD = $("#modal #dd-body-background table[data-edit]") || [],
					RDmax = RD.length,
					IR = $("#modal #dd-body-background img") || [],
					IRmax = IR.length,
					RE = $("#modal #dd-head, #modal #dd-body, #modal #dd-footer, #modal #dd-sidebar-left, #modal #dd-sidebar-right"),
					REmax = RE.length;
				$('#modal #dd-body-background .overly').remove();
				
				for(i=0; i < RDmax; i++)
				{
					
					$(RD[i]).css({
						width : $(RD[i]).parent().width() + 'px'
					});
					$(RD[i]).find('tr > td').css({
						padding:'15px 15px'
					});
					
					$(RD[i]).find('table tr > td').css({
						padding:'15px 15px'
					});
				}
				
				for(j=0; j < IRmax; j++)
				{
					$(IR[j]).css({
						width : '100%',
						height : 'auto'
					})
					.removeAttr('class');
				}
				
				for(r=0; r < REmax; r++)
				{
					var rem = $(RE[r]).html().trim();
					if(rem == '')
						$(RE[r]).remove();
				}
				
				setTimeout(function(){
					var AE = $("#modal .modal-body *"),
						AEmax = AE.length;
				
					for(k=0; k < AEmax; k++)
					{
						$(AE[k])
							.removeAttr('class')
							.removeAttr('data-edit')
							.removeAttr('id');
					}
					
					$button.prop('disabled',false);
				},50);
			},200);
		});
	});
	
	$(document).on('click','#test-submit', function(e){
		e.preventDefault();
		var $button = $(this),
			$input = $('#test-input'),
			val = $input.val().trim();
		
		$input.parent().parent().find('.alert').remove();
		
		if(val.length > 0)
		{
			if($.validate(val, 'EMAIL')===false)
			{
				$input.parent().after('<div class="alert alert-warning" role="alert">Email address have wrong format.</div>');
			}
			else
			{
				var $template = $("#saved-template"),
					oldHTML = $template.html(),
					body = '<body>' + oldHTML + '</body>';
				
				$.post(window.base + '/TESTING_ENDPOINT', {mail:val, body:body}).done(function(returns){
					if(returns == 'true')
					{
						$input.parent().after('<div class="alert alert-success" role="alert">Test email was successfully sent!</div>');
						$input.parent().remove();
						$button.text('Done').attr({'data-dismiss':'modal', 'id':null}).removeClass('btn-success').addClass('btn-primary').prepend('<span class="glyphicon glyphicon-ok"></span> ');
					}
					else
					{
						$input.parent().after('<div class="alert alert-danger" role="alert">Some error happen, can\'t send email.</div>');
					}
				}).fail(function(a,b,c){
					console.log(a,b,c);
					$input.parent().after('<div class="alert alert-danger" role="alert">Some error happen, can\'t send email.</div>');
				});
			}
		}
		else
			$input.parent().after('<div class="alert alert-danger" role="alert">You must insert email address.</div>');
	});
	
	/* Test Email Form */
	$("#test").on('click',function(e){
		e.preventDefault();
		
		var $button = $(this),
			data = $("#mail-template").html();
			data = data.replace(/(<button.*?>.*?<\/button>)/g,''),
			form = '';
			
			form+= '<div class="input-group input-group-lg">';
				form+= '<span class="input-group-addon">@</span>';
				form+= '<input type="text" class="form-control" placeholder="test@example.com" value="" id="test-input">';
			form+= '</div>';
			
			data = '<div id="saved-template" class="hidden">' + data + '</div>' + form;
		
		$button.prop('disabled',true);
		
		$("#modal").createModal({
			header		: "Send Test E-Mail",
			content		: data,
			footer		: '<button class="btn btn-block btn-success" id="test-submit" type="button">Send Message</button>',
			keyboard 	: true,
			static 		: true,
			close		: true,
			large		: false,
			class		: 'modal-preview'
		},
		function($this){
			$("#modal #dd-body-background").css({
				height:'',
			});
			
			setTimeout(function(){
                
                MediumEditorHook.clean();
                totalCleaner();
                
				var RD = $("#modal #dd-body-background table[data-edit]") || [],
					RDmax = RD.length,
					IR = $("#modal #dd-body-background img") || [],
					IRmax = IR.length,
					RE = $("#modal #dd-head, #modal #dd-body, #modal #dd-footer, #modal #dd-sidebar-left, #modal #dd-sidebar-right"),
					REmax = RE.length;
				
				$('#modal #dd-body-background .overly').remove();
				
				for(i=0; i < RDmax; i++)
				{
					
					$(RD[i]).css({
						width : '100%'
					});
					$(RD[i]).find('tr > td').css({
						padding:'',
						margin:''
					});
					
					$(RD[i]).find('table tr > td').css({
						padding:'',
						margin:''
					});
				}
				
				for(j=0; j < IRmax; j++)
				{
					$(IR[j]).css({
						width : '100%',
						height : 'auto'
					})
					.removeAttr('class');
				}
				
				for(r=0; r < REmax; r++)
				{
					var rem = $(RE[r]).html().trim();
					if(rem == '')
						$(RE[r]).remove();
					else{
						$(RE[r]).find('a').each(function(){
							$(this).css('text-decoration','none');
						});
					}
				}
				
				setTimeout(function(){
					var AE = $("#modal #saved-template *"),
						AEmax = AE.length;
				
					for(k=0; k < AEmax; k++)
					{
						$(AE[k])
							.removeAttr('class')
							.removeAttr('data-edit')
							.removeAttr('id');
					}
					
					$button.prop('disabled',false);
					
				},100);
				
			},200);
		});
	});
	
	/*****************************************************************
	 * Global Page Style Settings
	**/
	
	//Head Height
	$("#head-height").on("slide slideStop", function(slideEvt) {
		
		var val = slideEvt.value;
		
		if(val < 10)
			val = null;
		
		$("#head-height-val").text(val===null ? 'auto' : val + 'px');
		$("#dd-head").css('height',(val===null ? '' : val)).attr('height',val);
	});
	
	//Content Height
	$("#content-height").on("slide slideStop", function(slideEvt) {
		
		var val = slideEvt.value;
		
		if(val < 10)
			val = null;
		
		$("#content-height-val").text(val===null ? 'auto' : val + 'px');
		$("#dd-body").css('height',(val===null ? '' : val)).attr('height',val);
	});
	
	//Footer Height
	$("#footer-height").on("slide slideStop", function(slideEvt) {
		
		var val = slideEvt.value;
		
		if(val < 10)
			val = null;
		
		$("#footer-height-val").text(val===null ? 'auto' : val + 'px');
		$("#dd-footer").css('height',(val===null ? '' : val)).attr('height',val);
	});
	
	//Left Sidebar Height
	$("#left-height").on("slide slideStop", function(slideEvt) {
		
		var val = slideEvt.value;
		
		if(val < 10)
			val = null;
		
		$("#left-height-val").text(val===null ? 'auto' : val + 'px');
		$("#dd-sidebar-left").css('height',(val===null ? '' : val)).attr('height',val);
	});
	
	//Right Sidebar Height
	$("#right-height").on("slide slideStop", function(slideEvt) {
		
		var val = slideEvt.value;
		
		if(val < 10)
			val = null;
		
		$("#right-height-val").text(val===null ? 'auto' : val + 'px');
		$("#dd-sidebar-right").css('height',(val===null ? '' : val)).attr('height',val);
	});
	
	/* Content Background image */
	$('#content-bkg-image').on('form change keyup paste',$.debounce(250,function(e){
		var $this = $(this),
			value = $this.val().trim(),
			target = $('#dd-body');
		
		if(value=='')
			value = null;
		if($.isImage(value))
			target.attr('background',value+'?h='+$.rand(10000,99999)+''+$.rand(10000,99999)+''+$.rand(10000,99999)+''+$.rand(10000,99999));
		else
			target.attr('background',null);
	}));
	
	/* Head Background image */
	$('#head-bkg-image').on('form change keyup paste',$.debounce(250,function(e){
		var $this = $(this),
			value = $this.val().trim(),
			target = $('#dd-head');
		
		if(value=='')
			value = null;
		
		if($.isImage(value))
			target.attr('background',value+'?h='+$.rand(10000,99999)+''+$.rand(10000,99999)+''+$.rand(10000,99999));
		else
			target.attr('background',null);
	}));
	
	/* Footer Background image */
	$('#footer-bkg-image').on('form change keyup paste',$.debounce(250,function(e){
		var $this = $(this),
			value = $this.val().trim(),
			target = $('#dd-footer');
		
		if(value=='')
			value = null;
		
		if($.isImage(value))
			target.attr('background',value+'?h='+$.rand(10000,99999)+''+$.rand(10000,99999));
		else
			target.attr('background',null);
	}));
	
	/* Left Sidebar Background image */
	$('#left-bkg-image').on('form change keyup paste',$.debounce(250,function(e){
		var $this = $(this),
			value = $this.val().trim(),
			target = $('#dd-sidebar-left');
		
		if(value=='')
			value = null;
		
		if($.isImage(value))
			target.attr('background',value+'?h='+$.rand(10000,99999)+''+$.rand(10000,99999));
		else
			target.attr('background',null);
	}));
	
	/* Right Sidebar Background image */
	$('#right-bkg-image').on('form change keyup paste',$.debounce(250,function(e){
		var $this = $(this),
			value = $this.val().trim(),
			target = $('#dd-sidebar-right');
		
		if(value=='')
			value = null;
		
		if($.isImage(value))
			target.attr('background',value+'?h='+$.rand(10000,99999)+''+$.rand(10000,99999));
		else
			target.attr('background',null);
	}));
 
 
	/*****************************************************************
	 * Here starting main DOM snippets and functionality
	**/
	
	/* When form is changed, save into storage */
	$('#mail-template').isChange(function(e){
		
		if(window.location.hash)
		{
			var html = $(this).html(),
				id = window.location.hash,
				id = id.replace(/\#/,'');
			if(['no-sidebar','left-sidebar','right-sidebar','both-sidebar'].indexOf(id) > -1){
				$.storage('save-'+id,html);
			}
		}
	},{offset:1000});
    
    /* Load page settings */
    $(document).on('click touchstart','#setting', function(){
        $('#settings').toggleClass('in');
    });
    
    /* Dimiss tools */
    $('[data-dismiss="tools"]').on('click toucstart',function(e){
        e.preventDefault();
        var $this = $(this),
            parent = $this.parents('.' + $this.attr('data-dismiss'));
        
        if(parent)
            parent.toggleClass('in');
    });
		/* Save Template Form */
		$(document).on('click','#template-submit', function(e){
			e.preventDefault();
			var $button = $(this),
				$input = $('#template-input'),
				val = $input.val().trim(); 
			$input.parent().parent().find('.alert').remove();
			$button.text('Processing ').prepend('<i class="fa fa-spinner"></i>');
			if(val.length > 0)
			{ 
				  $.post({url:'SAVE_END_POINT', data:{ body: body, name:val},dataType:'json'}).done(function(returns){
						if(returns.status == true)
						{
							$input.parent().after('<div class="alert alert-success" role="alert">'+returns.message+'</div>');
							$input.parent().remove();
							$button.text('Done').attr({'data-dismiss':'modal', 'id':null}).removeClass('btn-success').addClass('btn-primary').prepend('<span class="glyphicon glyphicon-ok"></span> ');
						}
						else
						{
							$input.parent().after('<div class="alert alert-danger" role="alert">'+returns.message+'</div>');
						}
					}).fail(function(a,b,c){
						console.log(a,b,c);
						$input.parent().after('<div class="alert alert-danger" role="alert">'+returns.message+'</div>');
					});
			 
			}
			else
				$input.parent().after('<div class="alert alert-danger" role="alert">'+translations.must+' </div>');
		});
    
	/* When DOM is ready */
	$(document).ready(function(){
		// load theme on window refresh
		init.loadTheme(function(load){
			if(load===true)
			{
				init.editorLoad();
				init.dragAndDrop();
				init.loadOptions();
			}
		});
		$('[data-toggle="tooltip"]').tooltip();
	});
	
	/* When AJAX is complete */
	$(document).ajaxComplete(function(){
	
	});
	
	/* When resize happen */
	$(window).resize(function(){
	
	});
	
}(window.jQuery || window.Zepto));