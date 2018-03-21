WGL.Lib.Shaders=class Shaders{

}
WGL.Lib.Shaders.Shader=class Shader{
	constructor(){
		this.type="";
		this.text="";
	}
	compile(gl)
	{
		var shader=gl.createShader(gl[this.type]);
        gl.shaderSource(shader, this.text);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
	}
}
WGL.Lib.Shaders.VertexShader=class VertexShader extends WGL.Lib.Shaders.Shader{
	constructor(){
		super();
		this.type="VERTEX_SHADER";
		this.requiresNormals=false;
		this.requiresTextures=false;
		this.requresColors=false;
	}
}
WGL.Lib.Shaders.FragmentShader=class FragmentShader extends WGL.Lib.Shaders.Shader{
	constructor(){
		super();
		this.type="FRAGMENT_SHADER";
	}
}

WGL.Lib.Shaders.FragmentShader.Textured = class Textured extends WGL.Lib.Shaders.FragmentShader{
	constructor(){
		super();
		this.text=`
			precision mediump float;
			varying vec2 vTextureCoord;
			varying vec3 vLightWeighting;
			uniform sampler2D uSampler;
			void main(void) {
				vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
				gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
			}
		`;
	}
}
WGL.Lib.Shaders.VertexShader.Textured = class Textured extends WGL.Lib.Shaders.VertexShader{
	constructor(){
		super();
		this.requiresNormals=true;
		this.requiresTextures=true;
		this.text=`
		    attribute vec3 aVertexPosition;
			attribute vec3 aVertexNormal;
			attribute vec2 aTextureCoord;
			uniform mat4 uMVMatrix;
			uniform mat4 uPMatrix;
			uniform mat3 uNMatrix;
			uniform vec3 uAmbientColor;
			uniform vec3 uLightingDirection;
			uniform vec3 uDirectionalColor;
			uniform bool uUseLighting;
			varying vec2 vTextureCoord;
			varying vec3 vLightWeighting;
			void main(void) {
				gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
				vTextureCoord = aTextureCoord;
				if (!uUseLighting) {
					vLightWeighting = vec3(1.0, 1.0, 1.0);
				} else {
					vec3 transformedNormal = uNMatrix * aVertexNormal;
					float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
					vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
				}
			}
		`;
	}
}