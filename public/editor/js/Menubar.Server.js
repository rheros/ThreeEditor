/**
 * @author rheros / https://github.com/rheros
 */
Menubar.Server = function ( editor ) {

	//

	var config = editor.config;

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Server' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );
	//new
	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'New' );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

		}

	} );

	options.add( option );
	options.add( new UI.HorizontalRule() )

	//save

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Save' );
	
	option.onClick( function () {

		saveToServer( getEditorString(), true );

	} );

	options.add( option );

	//save as

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Save As' );
	option.onClick( function () {

		saveToServer( getEditorString(), false );

	} );
	options.add( option );

	options.add( new UI.HorizontalRule() )

	//open

	var option = new UI.Row();

	option.setClass( 'option' );
	option.setTextContent( 'getFileList' );
	option.onClick( function () {

		console.log( 'trigger click' )
		htmlobj = $.ajax( {
			url: "/sceneList",
			async: true,
			type: "POST",
			data: file,
			//dataType: "JSON",
			complete: function ( content, code ) {
				if ( content.status == 200 ) {

					var files = eval( content.responseText )
					selector.setDisplay( "block" );
					setFileList( files, selector )

				} else {

					console.log( "open failed , status is " + content.status );

				}

			}
		} );
	} );

	options.add( option );

	//scene list

	var selector = new UI.Select().setWidth( '100%' );
	selector.setDisplay( "None" )
	options.add( selector );

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	function saveToServer( Editordata, coverFile ) {

		var fileName = config.getKey( "sceneName" );
		var savePath = config.getKey( "sceneSavePath" );

		if ( fileName == "" ) {

			alert( "you need give the scene a name" )
			return
		}

		if ( savePath == "" ) {
			alert( "you need give the scene a savePath" )
			return
		}

		var finish = function ( resp, code ) {

			if ( resp.responseText == "exist" ) {

				if ( confirm( "file alread exist on server ,do you want to cover it" ) ) {

					saveToServer( Editordata, "true" );

				} else {

					console.log( "not save file because of exist" )
				}
			} else if ( resp.responseText == "false" ) {
				alert( "save faild when writ file!" );
			} else {
				console.log( "save success" )
			}
		}

		var formData = new FormData();

		//formData.append("file",createFile(Editordata));
		formData.append("name",fileName+".json");
		formData.append("path",savePath);
		formData.append("cover",coverFile);
		console.log(formData)
		htmlobj = $.ajax( {
			url: "/saveFile",
			//async: true,
			type: "POST",
			data: formData,
			processData:false,
			contentType:false,
			complete: finish,
			//dataType:"FormData",
		} )

	}

	function getEditorString() {

		var output = editor.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		return output;

	}

	function setFileList( files, selector ) {

		var options = []
		files.forEach( function ( file ) {
			options.push( file.substring( file.lastIndexOf( "\\" ) + 1 ) );
		} )

		selector.setOptions( options );
		selector.setValue( -1 )
		selector.onChange( function () {

			console.log( "in changed" )
			if ( confirm( "current scene will lost unless you have saved ,go on ?" ) ) {

				editor.clear();
				var file = files[ this.getValue() ]

				htmlobj = $.ajax( {
					url: "/openFile",
					async: true,
					type: "POST",
					data: {
						path: file
					},

					complete: function ( resp, code ) {

						var data = JSON.parse( resp.responseText )
						editor.fromJSON( data );
						editor.config.setKey( "sceneName", file.substring( file.lastIndexOf( "." ), file.lastIndexOf( "\\" ) + 1 ) )
						editor.signals.changeSceneName.dispatch();

					}
				} );
			} else {

				console.log( "cancle open file" )

			}

		} )

	}

	function createFile( content ) {
		return new Blob( [ content ], {
			type: 'text/plain'
		} )
	}
	return container;
};