var self = this;
var lumpnames = ["a","b","c"];
var fileInput = document.getElementById('fileInput');
var fileDisplayArea = document.getElementById('test');
var lumpList = null;
var loadingInterval;
var errors = document.getElementById('errors');

$('#preview').hide();
$('#lumpTable').hide();
$('#loading').hide();

var wad = Object.create(Wad);

function initWad() {
	$('#preview').hide();
	$('#lumpTable').hide();
	$('#loading').show();

	if (self.lumpList) self.lumpList.destructor();
	self.lumpnames = [];

	wad = Object.create(Wad);
	wad.onProgress = updateLoading;

	wad.onLoad = wadOnLoad;
}

function loadURL() {
	initWad();
	wad.loadURL(document.getElementById('urlInput').value);
}

fileInput.addEventListener('change', function(e) {
	initWad();
	var file = fileInput.files[0];
	console.log(file);
	wad.load(file);
});

var updateLoading = function(e) {
	var prg = e.loaded/e.total;
	var size = 20;
	var loadingbar = '[';
	for (var i = 0; i < size * prg; i++) loadingbar += '.';
	for (i = size * prg; i < 20; i++) loadingbar += '&nbsp;';
	document.getElementById('loading').innerHTML = loadingbar + ']';
};

function makeUL(array) {
	// Create the list element:
	var list = document.createElement('ol');
	list.id = "lumpUL";

	for(var i = 0; i < array.length; i++) {
		// Create the list item:
		var item = document.createElement('li');

		// Set its contents:
		var span = document.createElement('span');
		span.innerHTML += getIcon(array[i][0]);
		var name = document.createTextNode(' '+array[i][1]);
		span.appendChild(name);
		item.appendChild(span);

		item.id='item';

		// Add it to the list:
		list.appendChild(item);
	}

	// Finally, return the constructed list:
	return list;
}

function createTextPreview(text) {
	var textEl = document.createElement('div');
	textEl.style = "overflow: auto;";
	var height = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;
	textEl.style.height = height * 0.9;
	textnode = document.createTextNode(text);
	textEl.appendChild(textnode);
	$('#preview').append(textEl);
}

function createAudioPreview(data) {
	// Create information panel
	var textEl = document.createElement('div');
	textnode = document.createTextNode('Artist - Title');
	textEl.appendChild(textnode);

	// Create audio player
	var blob = new Blob([data]);
	audioEl = new Audio(URL.createObjectURL(blob));
	audioEl.controls = true;
	console.log(audioEl);

	// Add data to preview
	$('#preview').append(textEl);
	$('#preview').append(audioEl);
}

function createImagePreview(data) {
	var blob = new Blob([data]);
	imageEl = new Image();
	imageEl.src = URL.createObjectURL(blob);
	$('#preview').append(imageEl);
}

function createMIDIPreview(data) {
	var midiURL = URL.createObjectURL(new Blob([data]));
	var play = function() { MIDIjs.play(midiURL); }
	var stop = function() { MIDIjs.stop(); }

	var playButton = document.createElement('button');
	playButton.innerHTML='<i class="material-icons">play_arrow</i>';
	playButton.onclick = play;
	$('#preview').append(playButton);

	var stopButton = document.createElement('button');
	stopButton.innerHTML='<i class="material-icons">stop</i>';
	stopButton.onclick = stop;
	$('#preview').append(stopButton);
}

function getIcon(lumpType) {
	if (lumpType == MAP) return '<img src="icons/map.png">';
	if (lumpType == MAPDATA) return '<img src="icons/mapdata.png">';
	if (lumpType == TEXT) return '<img src="icons/text.png">';
	if (lumpType == PLAYPAL) return '<img src="icons/playpal.png">';
	if (lumpType == ENDOOM) return '<img src="icons/endoom.png">';
	if (lumpType == COLORMAP) return '<img src="icons/colormap.png">';
	if (lumpType == MUSIC) return '<img src="icons/music.png">';
	if (lumpType == MIDI) return '<img src="icons/midi.png">';
	if (lumpType == MP3) return '<img src="icons/mp3.png">';
	if (lumpType == GRAPHIC) return '<img src="icons/graphic.png">';
	if (lumpType == FLAT) return '<img src="icons/flat.png">';
	if (lumpType == PNG) return '<img src="icons/png.png">';
	if (lumpType == MUS) return '<img src="icons/mus.png">';
	if (lumpType == MARKER) return '<img src="icons/marker.png">';
	if (lumpType == PNAMES) return '<img src="icons/pnames.png">';
	if (TEXTUREx.indexOf(lumpType) >= 0) return '<img src="icons/texturex.png">';
	else return '<img src="icons/unknown.png">';
}

function wadOnLoad(e) {

	if (self.errormsg != null) {
		$(errors).html(self.errormsg);
	} else {

		for (var i = 0; i < wad.lumps.length; i++) {
			self.lumpnames.push([wad.detectLumpType(i),wad.lumps[i].name]);
		}

		$('#lumpTable').show();
		$('#loading').hide();
		$('#lumpList').html(makeUL(self.lumpnames));

		$('#lumpUL').delegate('li', 'click', function (e) {
			$('#preview').html('');
			$('#preview').show();
			while (e.target.id != 'item') e.target=e.target.parentNode;

			var li = e.target,
				i = 0;

			while ( li.previousElementSibling ) {
				li = li.previousElementSibling;
				i += 1;   
			}

			lumptype = wad.detectLumpType(i);

			switch (lumptype) {

				case PNG:
					$('#preview').html("");
					createImagePreview(wad.getLump(i));
					break;
				case MP3:
				case MUSIC:
					$('#preview').html("");
					createAudioPreview(wad.getLump(i));
					break;
				case MIDI:
					$('#preview').html("");
					createMIDIPreview(wad.getLump(i));
					break;
				case TEXT:
					$('#preview').html("");
					createTextPreview(wad.getLumpAsText(i));
					break;
				case PLAYPAL:
					playpal = Object.create(Playpal);
					playpal.load(wad.getLump(i));
					$("#preview").html("");
					document.getElementById("preview").appendChild(playpal.toCanvas());
					break;
				case COLORMAP:
					colormap = Object.create(Colormap);
					colormap.load(wad.getLump(i));
					$("#preview").html("");
					document.getElementById("preview").appendChild(colormap.toCanvas(wad));
					break;
				case FLAT:
					flat = Object.create(Flat);
					flat.load(wad.getLump(i));
					$("#preview").html("");
					document.getElementById("preview").appendChild(flat.toCanvas(wad));
					break;
				case GRAPHIC:
					graphic = Object.create(Graphic);
					graphic.load(wad.getLump(i));
					$("#preview").html("");
					document.getElementById("preview").appendChild(graphic.toCanvas(wad));
					break;
				case ENDOOM:
					endoom = Object.create(Endoom);
					endoom.onLoad = function() {
						$("#preview").html("");
						document.getElementById("preview").appendChild(endoom.toCanvas());
					};
					endoom.load(wad.getLump(i));
					$("#preview").html("");

					break;
				case MAP:
					map = Object.create(MapData);
					map.load(wad,wad.lumps[i].name);
					$("#preview").html("");
					var width = window.innerWidth
						|| document.documentElement.clientWidth
						|| document.body.clientWidth;
					var height = window.innerHeight
						|| document.documentElement.clientHeight
						|| document.body.clientHeight;
					document.getElementById("preview").appendChild(map.toCanvas((width - $('#lumpList').width()) * 0.8,height * 0.8));
					break;
				case MAPDATA:
					mapdata = Object.create(MapData);
					switch (wad.lumps[i].name) {
						case "VERTEXES":
							mapdata.parseVertexes(wad.getLump(i));
							$("#preview").html("Total vertexes: "+mapdata.vertexes.length.toString());
							break;
						case "LINEDEFS":
							mapdata.parseLinedefs(wad.getLump(i));
							$("#preview").html("Total linedefs: "+mapdata.linedefs.length.toString());
							break;
						case "SIDEDEFS":
							mapdata.parseSidedefs(wad.getLump(i));
							$("#preview").html("Total sidedefs: "+mapdata.sidedefs.length.toString());
							break;
						case "SECTORS":
							mapdata.parseSectors(wad.getLump(i));
							$("#preview").html("Total sectors: "+mapdata.sectors.length.toString());
							break;
						case "THINGS":
							mapdata.parseThings(wad.getLump(i));

							var tht = mapdata.getThingTable();
							var tab = "";
							console.log(mapdata.getDoomThingName(1));
							for (var prop in tht) {
								if (tht.hasOwnProperty(prop)) {
									console.log(prop);
									tab += mapdata.getDoomThingName(parseInt(prop));
									tab += "s: "+tht[prop]+"<br>";
								}
							}

							$("#preview").html("Total things: "+mapdata.things.length.toString()+"<p>"+tab);


							break;
						default:
							$("#preview").html("Unable to preview "+wad.lumps[i].name+" lumps");
							break;
					}
					break;
				case "...":
					$('#preview').html("Unable to preview this lump, and can't detect it's type<br>");
					var but = document.createElement('button');
					but.onclick = function viewAsText() {
						$('#preview').html("");
						createTextPreview(self.wad.getLumpAsText(i));
					};
					but.innerHTML="View as text";
					$('#preview').append(but);
					break;
				default:
					$('#preview').html("Unable to preview "+lumptype+" lumps");
					break;

			}
		});
	}
}
