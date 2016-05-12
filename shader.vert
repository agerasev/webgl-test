attribute vec2 apos;
attribute vec2 atexpos;

varying highp vec2 vtexpos;

void main(void) {
	gl_Position = vec4(apos, 0.0, 1.0);
	vtexpos = atexpos;
}
