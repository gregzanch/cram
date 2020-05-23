uniform sampler2D clearTexture;

void main()	{

	vec2 cellSize = 1.0 / resolution.xy;

	vec2 uv = gl_FragCoord.xy * cellSize;


	vec4 textureValue = texture2D( clearTexture, uv );

	textureValue.r = 127.5;
	textureValue.g = 0.0;

	gl_FragColor = textureValue;

}
