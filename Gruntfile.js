module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			sourceMap: true,
			build: {
				files: {
					'dist/wad.min.js': ['src/wad/constants.js', 'src/wad.js', 'src/wad/mapdata.js', 'src/wad/detectlump.js', 'src/wad/playpal.js', 'src/wad/colormap.js', 'src/wad/endoom.js', 'src/wad/flat.js', 'src/wad/graphic.js', 'src/wad/util.js', 'src/wad/mus2midi.js'],
					'dist/ui.min.js': ['src/panels/lump_list.js', 'src/panels/audio.js', 'src/panels/text.js', 'src/panels/image.js', 'src/panels/midi.js', 'src/ui.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['uglify']);
}
