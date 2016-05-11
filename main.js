var files = ['shader.vert', 'shader.frag'];

function start() {
	var cnt = files.length;
	if(cnt <= 0) {
		main();
		return;
	}
	for(var i in files) {
		(function(i) {
			$.get(files[i], function(data) {
				text = '' + data;
				files[i] = [files[i], text];
				if(--cnt <= 0) {
					main();
				}
			}, 'text');
		})(i);
	}
}

function main() {
	var canvas = document.getElementById("glcanvas");

	gl = initGL(canvas);
	
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// shaders
	var shaders = [];
	for(var i in files) {
		var name = files[i][0];
		var src = files[i][1];
		var type = null;
		if(/\.vert$/.test(name)) {
			type = gl.VERTEX_SHADER;
		} else if(/\.frag$/.test(name)) {
			type = gl.FRAGMENT_SHADER;
		} else {
			console.error('unknown shader source extension: ' + name);
			continue;
		}
		shaders.push(new Shader(type, src));
	}
	var prog = new Program(shaders);

	// buffer
	var buffer = new Buffer(gl.FLOAT);
	var vertices = [
		0.5, 0.5,
		-0.5, 0.5,
		0.5, -0.5,
		-0.5, -0.5
	];
	buffer.buffer(vertices);
	prog.attribs['apos'].data = buffer;

	// draw
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	prog.exec(gl.TRIANGLE_STRIP, 0, 4);
}

// var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
// gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

$(document).ready(start);