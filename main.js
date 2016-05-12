var files = {
	'shader.vert': null, 
	'shader.frag': null, 
	'128.png': null
};

function start() {
	var cnt = 0;
	for(var name in files) {
		cnt += 1;
	}
	if(cnt <= 0) {
		main();
		return;
	}
	var done = function(name, data) {
		files[name] = data;
		if(--cnt <= 0) {
			main();
		}
	}
	for(var name in files) {
		(function(name) {
			var res = /\.(\w+)$/.exec(name);
			var ext = null;
			if(res && res.length >= 2) {
				ext = res[1];
			}
			if(ext == 'png' || ext == 'jpg') {
				var img = new Image();
				img.onload = function() {
					done(name, img);
				}
				img.src = name;
			} else {
				$.get(name, function(data) {
					text = '' + data;
					done(name, text);
				}, 'text');
			}
		})(name);
	}
}

function main() {
	var canvas = document.getElementById("glcanvas");

	gl = initGL(canvas);
	
	
	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// shaders
	var shaders = [
		new Shader(gl.VERTEX_SHADER, files['shader.vert'], 'shader.vert'),
		new Shader(gl.FRAGMENT_SHADER, files['shader.frag'], 'shader.frag')
	];
	var prog = new Program(shaders);

	// buffers
	var pos = new Buffer(gl.FLOAT);
	var texpos = new Buffer(gl.FLOAT);
	var texposflip = new Buffer(gl.FLOAT);
	pos.buffer([
		1, 1,
		-1, 1,
		1, -1,
		-1, -1
	]);
	texpos.buffer([
		1, 1,
		0, 1,
		1, 0,
		0, 0
	]);
	texposflip.buffer([
		1, 0,
		0, 0,
		1, 1,
		0, 1
	]);
	prog.attribs['apos'].data = pos;
	prog.attribs['atexpos'].data = texpos;

	// texture
	var tex = new Texture(gl.RGBA);
	tex.load(files['128.png']);
	prog.uniforms['utex'].data = tex;

	// framebuffer
	var fb = new Framebuffer(gl.RGBA);
	fb.empty(512, 512);

	// draw
	prog.uniforms['utex'].data = tex;
	prog.attribs['atexpos'].data = texposflip;
	fb.bind();
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	prog.exec(gl.TRIANGLE_STRIP, 0, 4);
	fb.unbind();

	prog.uniforms['utex'].data = fb.texture;
	prog.attribs['atexpos'].data = texpos;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	prog.exec(gl.TRIANGLE_STRIP, 0, 4);
}

$(document).ready(start);