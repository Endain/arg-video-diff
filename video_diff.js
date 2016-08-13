var fs = require( 'fs' );
var jetpack = require( 'fs-jetpack' );
var youtubedl = require( 'youtube-dl' );
var spawn = require( 'child_process' ).spawn;

// First get the link to the videos to compare
var config = JSON.parse( fs.readFileSync( 'config.json' ) );
var baseDir = 'results/' + config.name;

// Track number of dumps completed
var dumps = 0;


// Create or delete workspace folder
jetpack.remove( baseDir );

jetpack.dir( baseDir );
jetpack.dir( baseDir + '/original' );
jetpack.dir( baseDir + '/original/frames' );
jetpack.dir( baseDir + '/compare' );
jetpack.dir( baseDir + '/compare/frames' );
jetpack.dir( baseDir + '/diff' );
jetpack.dir( baseDir + '/diff/frames' );


// Download both the original and compare videos
downloadVideo( config.original, baseDir + '/original/video.mp4', dumpFrames );
downloadVideo( config.compare, baseDir + '/compare/video.mp4', dumpFrames );


// Function to dump a videos frames
function dumpFrames( path ) {
    console.log( 'Dumping frames for ' + path );

    // Get the windows path
    var split = path.split( '/' );
    var winBase = '';
    for( var i = 0; i < split.length - 1; i++ )
        winBase += split[ i ] + '\\';

    // Fork a child process to rip frames
    var child = spawn( 'ffmpeg/ffmpeg', [ '-i', winBase + 'video.mp4', '-r', '30', winBase + 'frames\\frame%04d.png' ] );

    // When frames are dumped, signal completion
    child.on( 'exit', function () {
        console.log( 'Frames dumped...' );
        dumpFinished();
    } );
}

// Function to download a video
function downloadVideo( link, file, callback ) {
    // Start the download in format 137
    var video = youtubedl( link, [ '--format=137' ] );
    console.log( 'Fetching data for ' + link );

    // Pipe the video output to a file
    video.pipe( fs.createWriteStream( file ) );

    // Handle info events
    video.on( 'info', function ( info ) {
        console.log( 'Saving "' + info.title + '" to ' + file );
    } );

    // Handle completion event
    video.on( 'end', function () {
        // Trigger callback and pass file path
        if( callback )
            callback( file );
    } );
}

// Function to handle when a dump is finished
function dumpFinished() {
    dumps++;

    // If 2 dumps done, start diffing
    if( dumps >= 2 )
        diffFrames();
}

// Function to diff all the frames
function diffFrames() {
    console.log( 'Computing frame diffs...' );

    // Get the files to diff
    var original = fs.readdirSync( baseDir + '/original/frames/' ).sort( lexSort );
    var compare = fs.readdirSync( baseDir + '/compare/frames/' ).sort( lexSort );
    var count = original.length < compare.length ? original.length : compare.length;
    var completed = 0;
    var chunk = 0;
    var chunkSize = 100;

    nextChunk();

    function nextChunk() {
        // Track frame-in-chunk
        var start = chunk * chunkSize;
        var end = start + chunkSize;
        var frame = start;
        end = count < end ? count : end;

        // Diff every file
        var originalFrame = '';
        var compareFrame = '';
        var diffFrame = '';
        for( var i = start; i < end; i++ ) {
            originalFrame = baseDir + '/original/frames/' + original[ i ];
            compareFrame = baseDir + '/compare/frames/' + compare[ i ];
            diffFrame = baseDir + '/diff/frames/' + original[ i ];

            // Spawn a diff task
            var child = spawn( 'magick/convert', [ originalFrame, compareFrame, '-compose', 'difference', '-composite', '-evaluate', 'Pow', '2', '-separate', '-evaluate-sequence', 'Add', '-evaluate', 'Pow', '0.5', diffFrame ] );

            // Listen for finish
            child.on( 'exit', function () {
                completed++;
                frame++;

                if( completed >= count ) {
                    console.log( 'Diff computation completed...' );
                    makeFinalVideo();
                } else if( frame >= end ) {
                    chunk++;
                    console.log( end + ' frames done...' );
                    nextChunk();
                }
            } );
        }
    }
}

// Function to take all diff frames and put them into a lossless video
function makeFinalVideo() {
    console.log( 'Creating lossless video...' );

    // Fork a child process to make a lossless video
    var child = spawn( 'ffmpeg/ffmpeg', [ '-framerate', '30', '-i', baseDir + '/diff/frames/frame%04d.png', '-c:v', 'libx264', '-r', '30', '-preset', 'ultrafast', '-qp', '0', baseDir + '/diff/' + config.name + '.mkv' ] );

    // When lossless is done, compress it
    child.on( 'exit', function () {
        console.log( 'Creating compressed video...' );

        // Fork a child process to make a compressed video
        var child = spawn( 'ffmpeg/ffmpeg', [ '-i', baseDir + '/diff/' + config.name + '.mkv', '-c:v', 'libx264', '-b:v', '3500k', baseDir + '/diff/' + config.name + '.mp4' ] );

        // When compressed is done, finally done
        child.on( 'exit', function () {
            console.log( '\n\nDONE' );
        } );
    } );
}

// Function to sort lexicographically
function lexSort( a, b ) {
    a = parseInt( a.replace( /^\D+/g, '' ) );
    b = parseInt( b.replace( /^\D+/g, '' ) );

    return a - b;
}
