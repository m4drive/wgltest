WGL.Lib.Primitives=class Primitives{
	
}
WGL.Lib.Primitives.Primitive=class Primitive{
	constructor(){
		this.position=[0,0,0];
		this.rotation=[0,0,0];
		this.scale=[1,1,1];
		this.shaderProgram={};
		this.shaders=[];
		this.vertexPositionData=[];
		this.normalData=[];
		this.textureCoordData=[];
		this.indexData =[];
		this.texture={};
		this.textureSrc="";
		this.mvMatrix = mat4.create();
		this.lightningSettings={};
		this.gl={};
		this.pMatrix={};
	}
	degToRad(degrees) {
		return degrees * Math.PI / 180;
	}
	setGL(gl){
		this.gl=gl;
	}
	setCamera(pMatrix)
	{
		this.pMatrix=pMatrix;
	}
	setLightning(lightningSettings)
	{
		this.lightningSettings=lightningSettings;
	}
	draw ()
	{
		
	}
	prepare ()
	{
		
	}
}
WGL.Lib.Primitives.Sphere = class extends WGL.Lib.Primitives.Primitive{
	constructor(latitudeBands,longitudeBands,radius){
		super();
		this.latitudeBands=latitudeBands;
		this.longitudeBands=longitudeBands;
		this.radius=radius;
		this.vertexNormalBuffer={};
		this.vertexTextureCoordBuffer={};
		this.vertexPositionBuffer={};
		this.vertexIndexBuffer={};
		
	}
	draw ()
	{
		this.gl.useProgram(this.shaderProgram);
		//prepare lightning
		this.gl.uniform1i(this.shaderProgram.useLightingUniform, this.lightningSettings.enabled);
		if (this.lightningSettings.enabled) {
			this.gl.uniform3f(
				this.shaderProgram.ambientColorUniform,
				this.lightningSettings.ambient.color[0],
				this.lightningSettings.ambient.color[1],
				this.lightningSettings.ambient.color[2]
			);
			var lightingDirection = [
				this.lightningSettings.directional.direction[0],
				this.lightningSettings.directional.direction[1],
				this.lightningSettings.directional.direction[2]
			];
			var adjustedLD = vec3.create();
			vec3.normalize(lightingDirection, adjustedLD);
			vec3.scale(adjustedLD, -1);
			this.gl.uniform3fv(this.shaderProgram.lightingDirectionUniform, adjustedLD);
			this.gl.uniform3f(
				this.shaderProgram.directionalColorUniform,
				this.lightningSettings.directional.color[0],
				this.lightningSettings.directional.color[1],
				this.lightningSettings.directional.color[2]
			);
		}
		//prepare transform
		mat4.identity(this.mvMatrix);
		//position
		mat4.translate(this.mvMatrix,this.position);
		//rotation
		var newRotationMatrix = mat4.create();
		mat4.identity(newRotationMatrix);
		mat4.rotate(newRotationMatrix, this.degToRad(this.rotation[0]), [1, 0, 0]);
		mat4.rotate(newRotationMatrix, this.degToRad(this.rotation[1]), [0, 1, 0]);
		mat4.rotate(newRotationMatrix, this.degToRad(this.rotation[2]), [0, 0, 1]);
		mat4.multiply(this.mvMatrix, newRotationMatrix);
		//scale
		mat4.scale(this.mvMatrix, this.scale);
		
		
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		this.setMatrixUniforms();
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
	}
	setMatrixUniforms() {
		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
		this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
		var normalMatrix = mat3.create();
		mat4.toInverseMat3(this.mvMatrix, normalMatrix);
		mat3.transpose(normalMatrix);
		this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
	}
	prepare ()
	{
		//init shaders
		this.shaderProgram = this.gl.createProgram();
		this.shaders.forEach((x)=>(this.gl.attachShader(this.shaderProgram, x.compile(this.gl))));
		this.gl.linkProgram(this.shaderProgram);
		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}
		this.gl.useProgram(this.shaderProgram);
		
		
		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
		this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
		this.shaderProgram.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
		this.shaderProgram.nMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uNMatrix");
		this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
		this.shaderProgram.useLightingUniform = this.gl.getUniformLocation(this.shaderProgram, "uUseLighting");
		this.shaderProgram.ambientColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
		this.shaderProgram.lightingDirectionUniform = this.gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
		this.shaderProgram.directionalColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
		
		
		//calculate sphere
		for (var latNumber=0; latNumber <= this.latitudeBands; latNumber++) {
			var theta = latNumber * Math.PI / this.latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);
			for (var longNumber=0; longNumber <= this.longitudeBands; longNumber++) {
				var phi = longNumber * 2 * Math.PI / this.longitudeBands;
				var sinPhi = Math.sin(phi);
				var cosPhi = Math.cos(phi);
				var x = cosPhi * sinTheta;
				var y = cosTheta;
				var z = sinPhi * sinTheta;
				var u = 1 - (longNumber / this.longitudeBands);
				var v = 1 - (latNumber / this.latitudeBands);
				this.normalData.push(x);
				this.normalData.push(y);
				this.normalData.push(z);
				this.textureCoordData.push(u);
				this.textureCoordData.push(v);
				this.vertexPositionData.push(this.radius * x);
				this.vertexPositionData.push(this.radius * y);
				this.vertexPositionData.push(this.radius * z);
			}
		}
		for (var latNumber=0; latNumber < this.latitudeBands; latNumber++) {
			for (var longNumber=0; longNumber < this.longitudeBands; longNumber++) {
				var first = (latNumber * (this.longitudeBands + 1)) + longNumber;
				var second = first + this.longitudeBands + 1;
				this.indexData.push(first);
				this.indexData.push(second);
				this.indexData.push(first + 1);
				this.indexData.push(second);
				this.indexData.push(second + 1);
				this.indexData.push(first + 1);
			}
		}
		//fill buffers
		this.vertexNormalBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normalData), this.gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = this.normalData.length / 3;
		
		this.vertexTextureCoordBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoordData), this.gl.STATIC_DRAW);
		this.vertexTextureCoordBuffer.itemSize = 2;
		this.vertexTextureCoordBuffer.numItems = this.textureCoordData.length / 2;
		
		this.vertexPositionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertexPositionData), this.gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = this.vertexPositionData.length / 3;
		
		this.vertexIndexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexData), this.gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize = 1;
		this.vertexIndexBuffer.numItems = this.indexData.length;
		
		//init texture
		this.initTexture(this.gl);
		
	}
	initTexture(gl) {
		this.texture = gl.createTexture();
		this.texture.image = new Image();
		this.texture.image.onload = function () {
			this.handleLoadedTexture(gl,this.texture);
		}.bind(this);
		this.texture.image.src = this.textureSrc;
	}
	handleLoadedTexture(gl) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}