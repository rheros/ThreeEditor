var express = require( 'express' );
var bodyParser = require( "body-parser" );
var app = express();
var fs = require( "fs" );
var path = require( "path" )
var sceneRootPath = "public/sceneDir"
app.use( express.static( 'public' ) );

app.use( bodyParser.urlencoded( {
	extended: false,
} ) );

app.all( '*', function ( req, res, next ) {
	res.header( "Access-Control-Allow-Origin", "*" );
	res.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" );
	res.header( "Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS" );
	res.header( "X-Powered-By", ' 3.2.1' )
	res.header( "Content-Type", "application/json;charset=utf-8" );
	next();
} );

app.get( '/', function ( req, res ) {
	res.writeHead( 302, {
		'Location': '/editor'
		//add other headers here...
	} );
	res.end();
} )

app.post( '/saveFile', function ( req, res, next ) {
	console.log( req.param )
	console.log( req.query )
	console.log( req.body )
	return
	var fileName = req.body.name;
	var filePath = req.body.path;
	var data = req.files.data;
	var cover = req.body.cover == 'true';
	filePath = path.join( sceneRootPath, filePath )

	fs.exists( filePath, function ( exits ) {

		if ( !exits ) {

			fs.mkdir( filePath );
		}

		file = path.join( filePath, fileName );

		saveFile( res, file, data, cover );

	} );
} );

app.post( '/sceneList', function ( req, res ) {

	var list = walkDir( sceneRootPath );
	console.log( list + 'from post' )
	if ( list != undefined ) {

		res.send( list );

	} else {

		res.end();

	}

} )

app.post( '/openFile', function ( req, res ) {

	var filePath = req.body.path;
	fs.readFile( filePath, function ( err, data ) {
		if ( err ) {
			return console.error( err );
		}
		res.send( data.toString() );
	} );
} )

var server = app.listen( 80, function () {

	var host = server.address().address
	var port = server.address().port

	console.log( "应用实例，访问地址为 http://%s:%s", host, port )

} )

walkDir = function ( dir ) {
	var list = []
	var files = fs.readdirSync( dir )
	files.forEach( function ( file ) {
		var p = path.join( dir, file )
		//	console.log( 'in foreach ' + p )
		if ( fs.lstatSync( p ).isDirectory() ) {
			list = list.concat( walkDir( p ) )
		} else {
			list.push( p )
		}
	} )
	//	console.log( list + 'from walk ' + dir )
	return list

}

saveFile = function ( res, filePath, data, cover ) {

	fs.exists( filePath, function ( exits ) {
		if ( exits && !cover ) {

			console.log( "file exist and not allow to cover" );
			res.send( "exist" );

		} else {
			//fs.open( filePath, "w", null )
			fs.writeFile( filePath, data, function ( err ) {
				if ( err == null ) {
					res.send( "true" )
					console.log( 'success' );

				} else {
					res.send( "false" )
					console.log( err );
				}

			} )

		}

	} )
}