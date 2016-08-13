# arg-video-diff
_A handy tool for getting frame dumps and diff frames/video between two videos hosted on YouTube_


This is a tool I made for use in the Sombra ARG to investigate videos for hidden clues. It takes two YouTube video URLS and downloads the videos in 1080p, extracts every frame of each video to a PNG image, compares PNG images for every frame computing a new image highlighting the differences, then takes the difference frames and recompiles them into a video.

If you want to learn more about ARGs, check here:
https://en.wikipedia.org/wiki/Alternate_reality_game

If you want to learn more about the Sombra ARG, check here:
http://wiki.gamedetectives.net/index.php?title=Sombra_ARG


## Setup and Dependencies

#### Required dependencies
*node.js* (Required)

Node allows you to run javascript code outside of the browser. Download and install it from here:
https://nodejs.org/en/download/

*ffmpeg* (Included for Windows)

This command line program contains tons of tool for manipulating and encoding video. You do not need to install it, just download the 'static' build from here:
https://www.ffmpeg.org/download.html

*imagemagick* (Included for Windows)

This command line program contains tons of image creation and manipulation tools. You do not need to install it, just download the 'portable' from here:
http://www.imagemagick.org/script/binary-releases.php


#### Setup
 - Download and install node.js
 - Download the static ffmpeg build, extract it, place ffmpeg.exe into the ffmpeg folder
 - Download the portable imagemagick build, extract it, place compare.exe and convert.exe into the magick folder
 - Open up a command prompt in administrator mode
 - Navigate to the directory containing 'video_diff.js'
 - Execute the command: npm install


## Running the program

Once setup if complete you can use the tool as follows:
 - Open up the file 'config.json' in a text editor
 - Change the value for 'original' to be the YouTube link for the original video
 - Change the value for 'compare' to be the YouTube link for the video you want to compare to the original
 - Change the value for 'name' to be the name of the folder you want the results in (it will be a subfolder inside the 'results' folder)
 - Save the file
 - Open the command promp in administrator mode
 - Navigate to the folder containing video_diff.js
 - Run the command: node video_diff.js

 Status will be relayed to you through the command prompt, a message will notify you when it is done - it will take time!

*Be sure you have lots of disk space!*
You will need at least 10gb per minute of video!


_Endain_
