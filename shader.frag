uniform sampler2D utex;

varying highp vec2 vtexpos;

void main(void) {
	gl_FragColor = texture2D(utex, vtexpos);
}
