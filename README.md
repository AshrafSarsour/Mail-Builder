# Mail Builder - Drag and Drop JQuery Library

![N|Solid](https://avatars1.githubusercontent.com/u/27679993?s=120&v=4)

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

#  Features!
Mail Builder is a Jquery-Library,offline-with-templates,  powered with bootstrap to 
handle mail building templates and make email campaigns.
  - Drag and Drop .
  - Open Source .
  - high performance .

its simple let your clients to send birthday cards , some happy wishes or anniversary cards ( i love those )
or any thing you might see its suitable and dont reinvent a wheel right ? this builder saves time for you 
you just need to add your endpoint and customize it as you want .

# Components !
  - Adding Text , Image , button , URL , Divider .
  - Controlling height and also width and colors for each section separately .
  - sending testing Email to be validated before publishing . 
  - insert external urls and ability to save the designed template .

You can also:
  - apply it stand alone service . 
  - change its design and personlize it based on client or account .

Mail Builder is a lightweight library language based on the jquery dragable functions that helps people to send fancy emails .

### Technology !

Mail Builder uses ?

* BootStrap - HTML enhanced for web apps!
* Ace Editor - awesome web-based text editor
* jQueryui - duh
* jQuery - duh again 
* debounce - a debounce function is essential to ensuring a given task doesn't fire so often that it bricks browser performance.

### Installation

Just Fork it and you are good to go . 

### Development 

Want to contribute? Great!
Mail Builder , Make a change in your file and instantaneously see your updates!
Open your favorite Terminal and create a branch feature PR it and i will 
discuss it with you .

## Techincal Stuff 

##### in the  below function you need to add your endpoint to submit the testing template .
replace TESTING_ENDPOINT with your test template endpoint
$(document).on('click','#test-submit', function(e){
	});
  
##### in the  below function you need to add your endpoint to submit the template .
replace SAVE_END_POINT with your save template endpoint
$(document).on('click','#template-submit', function(e){
	});

 ##### in the  below function you need to add your endpoint to upload the images .
replace UPLOAD_FILE_ENDPOINT with your upload file endpoint
$(document).on('input change paste keyup','.add-image',$.debounce(350,function(e){
	});

 