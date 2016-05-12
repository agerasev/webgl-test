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

	if(gl.getExtension('OES_texture_float') == null) {
		console.error('no support for "OES_texture_float" found');
	}

	// shaders
	var shaders = {};
	for(var name in files) {
		var ext = /.(\w+)$/.exec(name)[1];
		var type = null;
		if(ext == 'vert') {
			type = gl.VERTEX_SHADER;
		} else if(ext == 'frag') {
			type = gl.FRAGMENT_SHADER;
		}
		if(type != null) {
			shaders[name] = new Shader(type, files[name], name);
			console.log(name);
		}
	}

	console.log(shaders);
	var prog = new Program([shaders['shader.vert'], shaders['shader.frag']]);

	// buffers
	var pos = new Buffer();
	var texpos = new Buffer();
	var texposflip = new Buffer();
	pos.buffer(new Float32Array([
		1, 1,
		-1, 1,
		1, -1,
		-1, -1
	]));
	texpos.buffer(new Float32Array([
		1, 1,
		0, 1,
		1, 0,
		0, 0
	]));
	texposflip.buffer(new Float32Array([
		1, 0,
		0, 0,
		1, 1,
		0, 1
	]));
	
	prog.attribs['apos'].data = pos;
	prog.attribs['atexpos'].data = texpos;

	// texture
	var tex = new Texture();
	tex.image(files['128.png']);
	prog.uniforms['utex'].data = tex;

	// framebuffer
	var fb = new Framebuffer();
	fb.empty(gl.FLOAT, 512, 512);

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